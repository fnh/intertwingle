import path from "path";
import { readFile } from "node:fs/promises";

import jsdom from "jsdom";
const { JSDOM } = jsdom;

import { directories, normUrl } from "../utils/directories.js"
import { simpleWordCount } from "../utils/simple-word-count.js"

const isTemplate = page => page.isTemplate;
const isStaticAsset = page => page.fileType === "static-asset";
const isContentPage = page => !isTemplate(page) && !isStaticAsset(page);

export function classifyElements(metamodel) {
    const pages = metamodel.pages;

    const staticAssets = pages.filter(isStaticAsset);
    const templates = pages.filter(isTemplate);
    const contentPages = pages.filter(isContentPage);

    return { staticAssets, templates, contentPages };
}

export function addBacklinks(metamodel) {

    for (let p of metamodel.pages) {
        if (isContentPage(p)) {
            const url = normUrl(p.fullQualifiedURL);
            const hasBacklink = p => isContentPage(p) && p.links.internal.some(backlinkCandidate => normUrl(backlinkCandidate) === url);
            const backlinks = metamodel.pages.filter(hasBacklink).map(p => {
                return {
                    url: normUrl(p.fullQualifiedURL),
                    title: p.title
                };
            });
            p.backlinks = backlinks;
        }
    }

}

function getTitle(dom) {
    const document = dom.window.document;

    const headline = document.getElementsByTagName("h1")[0];
    const value = (headline?.textContent || "").trim();

    return value;
}

function guessCategory(relativePath, metaTags) {

    if (metaTags.some(tag => tag.name === "category")) {
        return metaTags.find(tag => tag.name === "category");
    }

    let path = relativePath;
    if (relativePath.endsWith(".html")) {
        path = directories(path);
    }

    return path.split("/")[0];
}

function getTopics(metaTags) {
    const topicsTag = metaTags.find(tag => tag.name === "topics");

    if (topicsTag) {
        const topics =
            topicsTag.content.split(",")
                .map(topic => topic.trim())
                .filter(x => x);

        return topics;
    }

    return [];
}

function toFullQualifiedUrl(url, outfileRelativeToOutDir) {
    if (url.endsWith("/") && outfileRelativeToOutDir.startsWith("/")) {
        return url + outfileRelativeToOutDir.slice(1);
    }

    return url + outfileRelativeToOutDir;
}

export async function generateModel(
    inputDirectory,
    outputDir,
    contentFile,
    url,
) {
    const isStaticAsset = !contentFile.endsWith(".html");

    if (isStaticAsset) {
        let [, outfileRelativeToOutDir] = contentFile.split(inputDirectory);

        const outdir = path.resolve(outputDir);
        const outputPath = path.join(outdir, outfileRelativeToOutDir);


        return {
            inputDirectory,
            contentFile,
            outputPath,
            outputDirectory: outputDir,
            outfileRelativeToOutDir,
            fileType: "static-asset"
        };
    }

    const content = await readFile(contentFile, { encoding: "utf-8" });
    let contentDom = new JSDOM(content, { url });

    let [filename] = contentFile.split(".txt");
    let [, outfileRelativeToOutDir] = filename.split(inputDirectory);

    const outdir = path.resolve(outputDir);
    const outputPath = path.join(outdir, outfileRelativeToOutDir);

    const titleOfArticle = getTitle(contentDom);

    let d = contentDom.window.document;

    let metaTags = [...d.getElementsByTagName("meta")];

    let isTemplate = metaTags.some(tag => tag.name === "template")

    let links = [...d.getElementsByTagName("a")];

    let fullQualifiedURL = toFullQualifiedUrl(url, outfileRelativeToOutDir);

    let isPublished = !contentFile.split("/").some(x => x.startsWith("_"));

    const textContent = (d.body.textContent.trim() || "");

    let publicationDate = null;
    let [firstTimeTag] = [...d.getElementsByTagName("time")];
    if (!firstTimeTag) {
        let [art] = [...d.getElementsByTagName("article")];
        if (art && art.dataset.firstPublished) {
            publicationDate = art.dataset.firstPublished;
        }
    } else {
        publicationDate = firstTimeTag?.dateTime
    }

    let pageModel = {
        inputDirectory,
        filename,
        fileContent: content,

        fullQualifiedURL,
        title: titleOfArticle,
        textContent,
        isPublished,
        publicationDate,

        category: guessCategory(outfileRelativeToOutDir, metaTags),
        topics: getTopics(metaTags),
        wordCount: simpleWordCount(d).wordCount,

        links: {
            internal: links.map(l => l.href).filter(href => href.startsWith(url)),
            external: links.map(l => l.href).filter(href => !href.startsWith(url) && href.startsWith("http"))
        },

        isTemplate,

        outdir,
        outputPath,
        outfileRelativeToOutDir,

    }

    return pageModel
}


