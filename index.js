import { readdir, readFile } from "node:fs/promises";
import path from "path";
import { createPages } from "./create-pages.js"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateModel } from "./create-model.js";

// file system & path utils

const __dirname = dirname(fileURLToPath(import.meta.url));

function isExcluded(name, forbidden = []) {
    return name[0] === "." || forbidden.includes(name);
}

let websiteModel = [];

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

    let globalPropsContent = await readFile(path.resolve(__dirname, "intertwingle.json"), { encoding: "utf-8" });
    let globalProperties = JSON.parse(globalPropsContent);

    // todo enable defaults via intertwingle json, so that the command line argument can be reduced further

    if (!(inputDirectory && outputDirectory)) {
        console.log("Usage: node . inputDirectory outputDirectory");
        return;
    }

    let dryRun = (isDryRun === "--dry-run");

    let metamodel = await traverse(
        inputDirectory,
        (file) => generateModel(inputDirectory, outputDirectory, file, globalProperties.url)
    );

    if (dryRun) {
        return;
    }

    createPages({ pages: metamodel, globalProperties }); // await??
}

main();

