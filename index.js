import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { createPages } from "./create-pages.js"
import { dirname } from 'path';
import jsdom from "jsdom";
const { JSDOM } = jsdom;
import { fileURLToPath } from 'url';
import { directories } from "./utils/directories.js"
import { simpleWordCount } from "./utils/simple-word-count.js"

// file system & path utils

const __dirname = dirname(fileURLToPath(import.meta.url));

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

function toFullQualifiedUrl(url, outfileRelativeToOutDir) {
    if (url.endsWith("/") && outfileRelativeToOutDir.startsWith("/")) {
        return url + outfileRelativeToOutDir.slice(1);
    }

    return url + outfileRelativeToOutDir;
}

async function generateModel(
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

        fullQualifiedURL,
        title: titleOfArticle,
        textContent,
        isPublished,
        publicationDate,

        category: guessCategory(outfileRelativeToOutDir, metaTags),
        wordCount: simpleWordCount(d),

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


function isExcluded(name, forbidden = []) {
    return name[0] === "." || forbidden.includes(name);
}

let websiteModel = []; // TODO get rid of side effect to build up model

export async function traverse(
    directoryPath,
    processFn = () => { }
) {
    const files =
        await readdir(directoryPath, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directoryPath, file.name);

        if (file.isDirectory()) {
            if (isExcluded(file.name)) {
                // what to do?
            } else {
                let result = await traverse(filePath, processFn);
            }
        } else {
            if (isExcluded(file.name)) {
                // what to do?
            } else {
                let fn = await processFn(filePath);
                websiteModel.push(fn)
            }
        }
    }

    return websiteModel;
}


async function main() {
    const [inputDirectory, outputDirectory, isDryRun] = process.argv.slice(2)

    if (!(inputDirectory && outputDirectory)) {
        console.log("Usage: node . inputDirectory outputDirectory");
        return;
    }

    let dryRun = (isDryRun === "--dry-run");

    let globalPropsContent = await readFile(path.resolve(__dirname, "intertwingle.json"), { encoding: "utf-8" });
    let globalProperties = JSON.parse(globalPropsContent);


    let metamodel = await traverse(
        inputDirectory,
        (file) => generateModel(inputDirectory, outputDirectory, file, globalProperties.url)
    );

    if (dryRun) {
        return;
    }

    createPages({ pages: metamodel, globalProperties });
}

main();

