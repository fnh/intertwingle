import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "path";
import * as fs from 'fs';
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import { directories } from "../utils/directories.js"
import { applyPlugins } from "./apply-plugins.js"

const INTERTWINGLE = "intertwingle";

export async function createPages(metamodel) {

    const { staticAssets, templates, contentPages } = classifyElements(metamodel);

    const templatesMeta = await readAll(templates, metamodel.globalProperties.url);
    await createAll({ contentPages, metamodel, templatesMeta });
    await copyAll(staticAssets);
}

const isTemplate = page => page.isTemplate;
const isStaticAsset = page => page.fileType === "static-asset";

async function copyAsset(
    inputDirectory,
    outputDir,
    sourceFile,
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

function getTemplate(page, templatesMeta) {

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

    return defaultTemplate.content || templatesMeta[0].content;
}

function toTemplateMeta(templateContent, url) {
    let templateDom = new JSDOM(templateContent, { url });

    const [templateName] =
        [...templateDom.window.document.getElementsByTagName("meta")]
            .filter(meta => meta.name === "template")
            .map(metaEl => metaEl.content);

    return { name: templateName, content: templateContent }
}

function toCanonicalUrl(url) {
    return url.endsWith("index.html") ? directories(url) + "/" : url;
}


function classifyElements(metamodel) {
    const pages = metamodel.pages;

    const staticAssets = pages.filter(isStaticAsset);
    const templates = pages.filter(isTemplate);
    const contentPages = pages.filter(page => !isTemplate(page) && !isStaticAsset(page));

    return { staticAssets, templates, contentPages };
}

async function readAll(templates, url) {
    let templatesMeta = [];
    for (let template of templates) {
        let templateContent = await readFile(template.filename, { encoding: "utf-8" });
        templatesMeta.push(toTemplateMeta(templateContent, url));
    }

    return templatesMeta;
}

async function createAll({ contentPages, templatesMeta, metamodel }) {
    for (let page of contentPages) {
        await createPage({ page, templatesMeta, metamodel });
    }
}

async function copyAll(staticAssets) {
    for (let asset of staticAssets) {
        await copyAsset(asset.inputDirectory, asset.outputDirectory, asset.contentFile)
    }
}

function usesTemplate(contentDom) {
    const metatags = [...contentDom.window.document.getElementsByTagName("meta")];
    return !metatags.some(metaTag => metaTag.name === "no-template");
}

async function getTemplateDom({
    contentDom,
    page,
    templatesMeta,
    globalProperties
}) {

    let template = null;

    if (usesTemplate(contentDom)) {
        template = getTemplate(page, templatesMeta);
    } else {
        template = await readFile(page.filename, { encoding: "utf-8" });
    }

    return new JSDOM(template, { url: globalProperties.url });
}

async function createPage({ page, templatesMeta, metamodel }) {
    let globalProperties = metamodel.globalProperties;
    let content = await readFile(page.filename, { encoding: "utf-8" });
    let contentDom = new JSDOM(content, { url: globalProperties.url });

    let templateDom = await getTemplateDom({
        contentDom,
        page,
        templatesMeta,
        globalProperties
    });

    await applyPlugins({ templateDom, page, metamodel });

    let document = templateDom.window.document;

    setCanonicalUrl(document, page);

    await applyPlugins({ templateDom, page, metamodel });

    await cleanUpTags(document);

    const contentHtml = templateDom.serialize();

    if (!fs.existsSync(directories(page.outputPath))) {
        fs.mkdirSync(directories(page.outputPath), { recursive: true })
    }

    await writeFile(page.outputPath, contentHtml);
}

function setCanonicalUrl(document, page) {
    const links = [...document.getElementsByTagName("link")];
    let canonicalUrlTag = links.find((metaEl => metaEl.rel == "canonical"));
    if (canonicalUrlTag) {
        canonicalUrlTag.href = toCanonicalUrl(page.fullQualifiedURL);
    }
}

async function cleanUpTags(document) {
    removeTemplateTags(document);

    const intertwingleTags = [...document.getElementsByTagName(INTERTWINGLE)];
    for (let intertwingleTag of intertwingleTags) {
        intertwingleTag.remove();
    }
}

function removeTemplateTags(document) {
    let templateMetaRefs =
        [...document.getElementsByTagName("meta")]
            .filter(metaEl => metaEl.name == "template");

    for (let metaTag of templateMetaRefs) {
        metaTag.remove();
    }

}