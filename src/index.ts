#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

import Watcher from 'watcher';

import { createPages } from "./core/create-pages.ts"
import { generateModel, addBacklinks } from "./core/create-model.ts";

import { traverse } from "./core/traverse.ts"
import type { GlobalProperties, WebsiteModel } from "./types/model.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {

    let commandLineArgs = process.argv.slice(2);
    const [inputDirectory, outputDirectory, command] = commandLineArgs;

    const globalPropertiesFile =
        path.resolve(__dirname, inputDirectory, "intertwingle.json");

    let globalPropertiesContent = await readFile(globalPropertiesFile, { encoding: "utf-8" });
    let globalProperties: GlobalProperties = JSON.parse(globalPropertiesContent);

    // todo enable defaults via intertwingle json, so that the command line argument can be reduced further

    if (!(inputDirectory && outputDirectory)) {
        console.log("Usage: node . inputDirectory outputDirectory [--dry-run]");
        return;
    }

    let dryRun = (command === "--dry-run");
    let isWatchMode = (command === "watch");
    let generateDrafts = (command === "watch-all");


    let generateWebsite = async () => {
        console.log("(re)-generating website")

        const createModel = (file: string) => generateModel(
            inputDirectory,
            outputDirectory,
            file,
            globalProperties.url
        );

        let pages = await traverse(
            inputDirectory,
            createModel,
        );

        let model: WebsiteModel = { pages, globalProperties }
        addBacklinks(model);

        if (dryRun) {
            console.log("Dry run, only builds models, but doesn't create output");
            return;
        }

        await createPages(model, generateDrafts);

        initialGenerationComplete = true;
    }

    let initialGenerationComplete = false;

    if (isWatchMode || generateDrafts) {
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
            // } else {
            //     console.log("site (re-)generation currently in progress...", targetPath)
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