import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "path";
import * as fs from 'fs';
import jsdom from "jsdom";
import { directories } from "./utils/directories.js"

const { JSDOM } = jsdom;

const INTERTWINGLE = "intertwingle"

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
    // TODO: generalize look up, 
    // assume some kind of hint on which template to use in page
    // if not then use default template

    return templatesMeta[0].content;
}

function toTemplateMeta(templateContent, url) {
    let templateDom = new JSDOM(templateContent, { url });

    const [templateName] =
        [...templateDom.window.document.getElementsByTagName("meta")]
            .filter(meta => meta.name === "template")
            .map(metaEl => metaEl.content);

    // console.log(templateContent);
    return { name: templateName, content: templateContent }
}

function toCanonicalUrl(url) {
    return url.endsWith("index.html") ? directories(url) + "/" : url;
}

export async function createPages(metamodel) {
    const pages = metamodel.pages;
    
    const staticAssets = pages.filter(isStaticAsset);
    const templates = pages.filter(isTemplate);
    const contentPages = pages.filter(page => !isTemplate(page) && !isStaticAsset(page));

    let globalProperties = metamodel.globalProperties;

    // preparation step: read all template files into memory

    let templatesMeta = [];
    for (let template of templates) {
        let templateContent = await readFile(template.filename, { encoding: "utf-8" });
        templatesMeta.push(toTemplateMeta(templateContent, globalProperties.url));
    }

    for (let page of contentPages) {
        await createPage({ page, templatesMeta, metamodel });
    }

    for (let asset of staticAssets) {
        await copyAsset(asset.inputDirectory, asset.outputDirectory, asset.contentFile)
    }

}

async function createPage({ page, templatesMeta, metamodel }) {
    let globalProperties = metamodel.globalProperties;
    let content = await readFile(page.filename, { encoding: "utf-8" });
    let contentDom = new JSDOM(content, { url: globalProperties.url });
    const metatags = [...contentDom.window.document.getElementsByTagName("meta")];
    let useTemplate =
        !metatags.some(metaTag => metaTag.name === "no-template");

    // find appropriate template for page
    let template = null;

    if (useTemplate) {
        template = getTemplate(page, templatesMeta);
    } else {
        template = await readFile(page.filename, { encoding: "utf-8" });
    }

    let templateDom = new JSDOM(template, { url: globalProperties.url });
    let document = templateDom.window.document;

    let intertwingledTags = [...document.getElementsByTagName(INTERTWINGLE)];

    for (let intertwinglePlugin of intertwingledTags) {

        let getPluginParams = (pluginTag) => {
            let params = {};
            for (let attr of pluginTag.getAttributeNames().filter(x => x !== "plugin")) {
                params[attr] = pluginTag.getAttribute(attr);
            }
            return params;
        }

        let pluginName = intertwinglePlugin.getAttribute("plugin");

        let pluginParams = getPluginParams(intertwinglePlugin);

        let pluginImport = () => import(`./plugins/${pluginName}.js`)

        try {
            const { default: pluginFn } = await pluginImport();

            // todo replace globalProperties with metamodel in plugins
            await pluginFn(
                templateDom,
                page,
                globalProperties,
                metamodel,
                pluginParams
            );

        } catch (e) {
            console.error(e);
            console.log("trouble with plugin", pluginName)
        }
    }

    if (!fs.existsSync(directories(page.outputPath))) {
        fs.mkdirSync(directories(page.outputPath), { recursive: true })
    }


    const links = [...document.getElementsByTagName("link")];
    let canonicalUrlTag = links.find((metaEl => metaEl.rel == "canonical"));
    if (canonicalUrlTag) {
        canonicalUrlTag.href = toCanonicalUrl(page.fullQualifiedURL);
    }

    let templateMetaRefs =
        [...document.getElementsByTagName("meta")]
            .filter(metaEl => metaEl.name == "template");

    for (let metaTag of templateMetaRefs) {
        metaTag.remove();
    }

    const intertwingleTags = [...document.getElementsByTagName(INTERTWINGLE)];
    for (let intertwingleTag of intertwingleTags) {
        intertwingleTag.remove();
    }

    const contentHtml = templateDom.serialize();

    await writeFile(page.outputPath, contentHtml);
    templateDom = null;
}