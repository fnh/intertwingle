#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { readFile } from "node:fs/promises";

import { createPages } from "./core/create-pages.js"
import { generateModel, addBacklinks } from "./core/create-model.js";
import { traverse } from "./core/traverse.js"

async function main() {
    const [inputDirectory, outputDirectory, isDryRun] = process.argv.slice(2)

    const globalPropertiesFile =
        path.resolve(__dirname, inputDirectory, "intertwingle.json");
        
    let globalPropsContent = await readFile(globalPropertiesFile, { encoding: "utf-8" });
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

    addBacklinks({ pages: metamodel });

    await createPages({ pages: metamodel, globalProperties });
}

await main();