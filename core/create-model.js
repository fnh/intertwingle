import path from "path";
import { readFile } from "node:fs/promises";

import jsdom from "jsdom";
const { JSDOM } = jsdom;

import { directories, normUrl } from "../utils/directories.js"
import { wordCount } from "../utils/word-count.js"

const isTemplate = page => page.isTemplate;
const isStaticAsset = page => page.fileType === "static-asset";
const isContentPage = page => !isTemplate(page) && !isStaticAsset(page);

export function classifyElements(model) {
    const pages = model.pages;

    const staticAssets = pages.filter(isStaticAsset);
    const templates = pages.filter(isTemplate);
    const contentPages = pages.filter(isContentPage);

    return { staticAssets, templates, contentPages };
}

export function addBacklinks(model) {

    for (let p of model.pages) {
        if (isContentPage(p)) {
            const url = normUrl(p.fullQualifiedURL);
            const hasBacklink = p => isContentPage(p) && p.isPublished && p.links.internal.some(backlinkCandidate => normUrl(backlinkCandidate) === url);
            const backlinks = model.pages.filter(hasBacklink).map(p => {
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
    return (headline?.textContent || "").trim();
}

function getCategory(relativePath, metaTags) {

    if (metaTags.some(tag => tag.name === "category")) {
        const category = metaTags.find(tag => tag.name === "category").content;
        return category;
    }

    let path =
        relativePath.endsWith(".html") ? directories(relativePath) : relativePath;

    let index = path.startsWith("/") ? 1 : 0;

    const category = path.split("/")[index];
    return category;
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

function isDraft(metaTags) {
    const draftTag = metaTags.find(tag => tag.name === "draft");
    return !!draftTag;

}

function toFullQualifiedUrl(url, outfileRelativeToOutDir) {
    if (url.endsWith("/") && outfileRelativeToOutDir.startsWith("/")) {
        // omit the "/" of outfileRelativeToOutDir
        return url + outfileRelativeToOutDir.slice(1);
    }

    return url + outfileRelativeToOutDir;
}

function getPublicationDate(document) {
    const [firstTimeTag] = [...document.getElementsByTagName("time")];
    if (!firstTimeTag) {
        const [article] = [...document.getElementsByTagName("article")];
        if (article && article.dataset.firstPublished) {
            return article.dataset.firstPublished;
        }
    } else {
        return firstTimeTag?.dateTime;
    }
}

function getRevisionDate(document) {
    const revisionTimeTag = document.querySelector("time[data-revised-at]");
    if (!revisionTimeTag) {
        return null;
    } else {
        return revisionTimeTag.dateTime;
    }
}


export async function generateModel(
    inputDirectory,
    outputDir,
    contentFile,
    url,
) {
    const [, outfileRelativeToOutDir] = contentFile.split(inputDirectory);
    const outdir = path.resolve(outputDir);
    const outputPath = path.join(outdir, outfileRelativeToOutDir);

    if (!contentFile.endsWith(".html")) {
        // it is a static asset
        return {
            fileType: "static-asset",
            inputDirectory,
            filename: contentFile,
            outputPath,
            outputDirectory: outputDir,
            outfileRelativeToOutDir,
        };
    }

    // it is a page or a template

    const content =
        await readFile(contentFile, { encoding: "utf-8" });
    const contentDom = new JSDOM(content, { url });

    const document = contentDom.window.document;

    const metaTags = [...document.getElementsByTagName("meta")];

    const isTemplate =
        metaTags.some(tag => tag.name == "template")

    const links = [...document.getElementsByTagName("a")];

    const publicationDate = getRevisionDate(document) ?? getPublicationDate(document);

    const isPublished = !isDraft(metaTags);

    const textContent = (document.body.textContent.trim() || "");

    const isInternalLink = href => !href.startsWith(url) && href.startsWith("http");
    const isExternalLink = href => href.startsWith(url);

    return {
        inputDirectory,
        filename: contentFile,
        fileContent: content,

        fullQualifiedURL: toFullQualifiedUrl(url, outfileRelativeToOutDir),
        title: getTitle(contentDom),
        textContent,

        isPublished,
        publicationDate,

        category: getCategory(outfileRelativeToOutDir, metaTags),
        topics: getTopics(metaTags),
        wordCount: wordCount(document),

        links: {
            internal: links.map(l => l.href).filter(isExternalLink),
            external: links.map(l => l.href).filter(isInternalLink),
        },

        isTemplate,

        outdir,
        outputDirectory: outdir,
        outputPath,
        outfileRelativeToOutDir,

    }
}


