import { readFile } from "node:fs/promises";
import path from "path";
import { createPages } from "./create-pages.js"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateModel } from "./create-model.js";
import { traverse } from "./traverse.js"

const __dirname = dirname(fileURLToPath(import.meta.url));

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
        console.log("Dry run, only builds models, but doesn't create output");
        return;
    }

    await createPages({ pages: metamodel, globalProperties });
}

main();

