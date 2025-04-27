import { writeFile, copyFile } from "node:fs/promises";
import path from "path";
import * as fs from 'fs';

import { directories } from "../utils/directories.ts";
import { listify } from "../utils/listify.ts";
import { applyPlugins } from "./apply-plugins.ts";
import { classifyElements, isContentPage } from "./create-model.ts";

import type { GlobalProperties, PageModel, PageModelExtended, PageSource, TemplatePage, WebsiteContent, WebsiteModel } from "../types/model.ts";
import { toDom, type DocumentObjectModel } from "./dom-adapter.ts";

// import  websiteStatistics  from "../plugins/website-statistics.js";

const INTERTWINGLE = "intertwingle";

export async function createPages(
    model: WebsiteModel,
    emitAll = false
) {

    const { staticAssets, templates, contentPages } = classifyElements(model);

    const templatesMeta = await readAll(templates, model.globalProperties.url);
    await createAll({ contentPages, metamodel: model, templatesMeta }, emitAll);
    await copyAll(staticAssets);

    // await websiteStatistics({metamodel: model});
}

async function copyAsset(
    inputDirectory: string,
    outputDir: string,
    sourceFile: string,
) {

    let filename = sourceFile;
    let [, outfileRelativeToOutDir] = filename.split(inputDirectory);

    const outdir = path.resolve(outputDir);
    const outputPath = path.join(outdir, outfileRelativeToOutDir);

    if (!fs.existsSync(directories(outputPath))) {
        fs.mkdirSync(directories(outputPath), { recursive: true })
    }

    await copyFile(sourceFile, outputPath);
}

function getTemplate(page: PageModelExtended, templatesMeta: Array<TemplatePage>): string {

    if (!templatesMeta.length) {
        return "";
    }

    if (page.category) {
        const categoryTemplate = templatesMeta.find(t => t.name === page.category);
        if (categoryTemplate) {
            return categoryTemplate.content;
        }
    }

    const defaultTemplate =
        templatesMeta.find(t => t.name === "default");

    return defaultTemplate?.content || templatesMeta[0]?.content || "";
}

function toTemplateMeta(templateContent: string, url: string): Array<TemplatePage> {
    let templateDom = toDom({ html: templateContent, baseUrl: url });

    const [templateName] =
        [...templateDom.document.getElementsByTagName("meta")]
            .filter(meta => meta.name === "template")
            .map(metaEl => metaEl.content);

    const templates = (listify(templateName) as Array<string>).map(name => {
        return { name, content: templateContent };
    });

    return templates;
}

function toCanonicalUrl(url: string): string {
    return url.endsWith("index.html") ? directories(url) + "/" : url;
}

async function readAll(templates: Array<PageModelExtended>, url: string) {
    let templatesMeta: Array<TemplatePage> = [];
    for (let template of templates) {
        let templateContent = template.fileContent;
        const templates = toTemplateMeta(templateContent, url);
        for (let t of templates) {
            templatesMeta.push(t);
        }
    }

    return templatesMeta;
}


async function createAll({ contentPages, templatesMeta, metamodel }: WebsiteContent, emitAll = false) {


    for (let page of metamodel.pages) {
        if (isContentPage(page)) {
            if (page.isPublished || emitAll) {
                await createPage({ page, templatesMeta, metamodel });
            } else {
                //console.log("skip emitting non-published page", page.filename)
            }
        }
    }
}

async function copyAll(staticAssets: Array<PageModel>) {
    for (let asset of staticAssets) {
        await copyAsset(asset.inputDirectory, asset.outputDirectory, asset.filename)
    }
}

function usesTemplate(contentDom: DocumentObjectModel) {
    const metatags = [...contentDom.document.getElementsByTagName("meta")];
    return !metatags.some(metaTag => metaTag.name === "no-template");
}

async function getTemplateDom({
    contentDom,
    page,
    templatesMeta,
    globalProperties
}: {
    contentDom: DocumentObjectModel,
    page: PageModelExtended,
    templatesMeta: Array<TemplatePage>,
    globalProperties: GlobalProperties
}) {
    let template: string;

    if (usesTemplate(contentDom)) {
        template = getTemplate(page, templatesMeta);
    } else {
        template = page.fileContent;
    }

    if (page.template) {
        let t = templatesMeta.find(t => t.name == page.template)
        if (t) {
            template = t.content;
        }
    }

    return toDom({ html: template, baseUrl: globalProperties.url });
}



async function createPage({ page, templatesMeta, metamodel }: PageSource) {
    let globalProperties = metamodel.globalProperties;
    let content = page.fileContent;
    let domOfPage = toDom({ html: content, baseUrl: globalProperties.url })

    let templateDom = await getTemplateDom({
        contentDom: domOfPage,
        page,
        templatesMeta,
        globalProperties
    });

    await applyPlugins({ templateDom, page, metamodel });

    let document = templateDom.document;

    setCanonicalUrl(document, page);

    let pluginApplicationCycles = 0;
    while ([...document.getElementsByTagName(INTERTWINGLE)].filter(element => element.getAttribute("plugin")).length && pluginApplicationCycles < 10) {
        await applyPlugins({ templateDom, page, metamodel });
        pluginApplicationCycles++;
    }

    await cleanUpTags(document);

    const contentHtml = templateDom.serialize();

    if (!fs.existsSync(directories(page.outputPath))) {
        fs.mkdirSync(directories(page.outputPath), { recursive: true })
    }

    await writeFile(page.outputPath, contentHtml);
}

function setCanonicalUrl(document: Document, page: PageModelExtended) {
    const links = [...document.getElementsByTagName("link")];
    let canonicalUrlTag = links.find((metaEl => metaEl.rel == "canonical"));
    if (canonicalUrlTag) {
        canonicalUrlTag.href = toCanonicalUrl(page.fullQualifiedURL);
    }
}

async function cleanUpTags(document: Document) {
    removeTemplateTags(document);

    const intertwingleTags = [...document.getElementsByTagName(INTERTWINGLE)];
    for (let intertwingleTag of intertwingleTags) {
        //console.log("removing remaining intertwingle tag", intertwingleTag.getAttribute("plugin"))
        intertwingleTag.remove();
    }
}

function removeTemplateTags(document: Document) {
    let templateMetaRefs =
        [...document.getElementsByTagName("meta")]
            .filter(metaEl => metaEl.name == "template");

    for (let metaTag of templateMetaRefs) {
        metaTag.remove();
    }

}