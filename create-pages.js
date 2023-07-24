import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "path";

import * as fs from 'fs';

import jsdom from "jsdom";
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

    const [templateName] = [...templateDom.window.document.getElementsByTagName("meta")].filter(meta => meta.name === "template").map(metaEl => metaEl.content);

    return { name: templateName, content: templateContent }
}


function directories(path) {
    // assumption: path ends with a filename
    let all = path.split("/");
    let dirs = all.slice(0, all.length - 1)

    return dirs.join("/")

}

export async function createPages(metamodel) {

    let pages = metamodel.pages

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
        // let content = await readFile(page.filename, { encoding: "utf-8" });
        //let contentDom = new JSDOM(content, { url: globalProperties.url });

        // find appropriate template for page
        let template = getTemplate(page, templatesMeta);

        let templateDom = new JSDOM(template, { url: globalProperties.url });
        let document = templateDom.window.document;

        let intertwingledTags = document.getElementsByTagName(INTERTWINGLE);

        if (intertwingledTags.length) {

            let plugins =
                [...intertwingledTags].map(t => t.getAttribute("plugin"));

            let pluginsDedup =
                Array.from(new Set(plugins));

            let pluginImportMap =
                pluginsDedup.reduce((importMap, plugin) => {
                    importMap[plugin] = () => import(`./plugins/${plugin}.js`);
                    return importMap;
                }, {});

            for (let plugin of pluginsDedup) {
                try {
                    const { default: pluginFn } = await pluginImportMap[plugin]();

                    await pluginFn(templateDom, page, globalProperties);
                } catch {
                    console.log("trouble with plugin", plugin)
                }

            }

            if (!fs.existsSync(directories(page.outputPath))) {
                fs.mkdirSync(directories(page.outputPath), { recursive: true })
            }

            let templateMetaRef =
                [...templateDom.window.document.getElementsByTagName("meta")]
                    .filter(metaEl => metaEl.name == "template")

            for (let metaTag of templateMetaRef) {
                metaTag.remove()
            }

            const contentHtml = templateDom.serialize();

            await writeFile(page.outputPath, contentHtml);
            templateDom = null;
        }

    }

    for (let asset of staticAssets) {
        await copyAsset(asset.inputDirectory, asset.outputDirectory, asset.contentFile)
    }

}