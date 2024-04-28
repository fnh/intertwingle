#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { readFile } from "node:fs/promises";

import { createPages } from "./core/create-pages.js"
import { generateModel, addBacklinks } from "./core/create-model.js";
import { traverse } from "./core/traverse.js"

import Watcher from 'watcher';

async function main() {

    let commandLineArgs = process.argv.slice(2);
    const [inputDirectory, outputDirectory, command] = commandLineArgs;

    const globalPropertiesFile =
        path.resolve(__dirname, inputDirectory, "intertwingle.json");

    let globalPropertiesContent = await readFile(globalPropertiesFile, { encoding: "utf-8" });
    let globalProperties = JSON.parse(globalPropertiesContent);

    // todo enable defaults via intertwingle json, so that the command line argument can be reduced further

    if (!(inputDirectory && outputDirectory)) {
        console.log("Usage: node . inputDirectory outputDirectory [--dry-run]");
        return;
    }

    let dryRun = (command === "--dry-run");
    let isWatchMode = (command === "watch");


    let generateWebsite = async () => {
        console.log("(re)-generating website")

        const createModel = (file) => generateModel(
            inputDirectory,
            outputDirectory,
            file,
            globalProperties.url
        );

        let pages = await traverse(
            inputDirectory,
            createModel,
        );
        let model = { pages, globalProperties }
        addBacklinks(model);

        if (dryRun) {
            console.log("Dry run, only builds models, but doesn't create output");
            return;
        }

        await createPages(model);

        initialGenerationComplete = true;
    }

    let initialGenerationComplete = false;

    if (isWatchMode) {
        let ignore = (watchedPath) => {
            let isIgnored = [
                path.join(inputDirectory, ".git"),
                path.join(inputDirectory, "node_modules"),
                outputDirectory
            ].some(ignored => watchedPath.startsWith(ignored));

            return isIgnored;
        }

        const watcher = new Watcher(inputDirectory, {
            ignore,
            recursive: true,
            native: false,
        });

        watcher.on("all", (event, targetPath, targetPathNext) => {
            // console.log({ event, targetPath, targetPathNext });

            if (initialGenerationComplete) {
                generateWebsite();
            } else {
                console.log("site (re-)generation currently in progress...", targetPath)
            }


            // generateWebsite();
        });
    }

    await generateWebsite();

    if (isWatchMode) {
        console.log("Initial generation completed. Watching for changes...")
    }
}

await main();