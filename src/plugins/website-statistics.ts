import { type PluginArgument } from '../core/apply-plugins.ts';
import * as fs from 'fs';
import { writeFile } from "node:fs/promises";

import { directories } from "../utils/directories.ts";
import { isContentPage } from "../core/create-model.ts";

export default async function websiteStatistics({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}: PluginArgument) {

    let params = pluginParams;
    let outdir = page.outdir.endsWith("/") ? page.outdir : page.outdir + "/";
    let outputPath = outdir + params.filename;

    let totalWords = 0;
    let wordCounts = [];
    let docCount = 0;

    let dateStats = {}
    let categoryStats = {};

    // classify & iterate over contentpages only
    for (let page of metamodel.pages) {
        if (isContentPage(page)) {
            if (page.publicationDate) {

                let d = new Date(page.publicationDate);

                if (!dateStats[d.getFullYear()]) {
                    dateStats[d.getFullYear()] = {};
                }

                if (page.category && !dateStats[d.getFullYear()][page.category]) {
                    dateStats[d.getFullYear()][page.category] = 0;
                }

                if (page.category && page.isPublished) {
                    dateStats[d.getFullYear()][page.category]++;
                } else {
                }


            }

            if (page.wordCount && page.wordCount > 100) {
                totalWords += page.wordCount;
                docCount++;
                wordCounts.push(page.wordCount);
            }

            if (page.category && !categoryStats[page.category]) {
                categoryStats[page.category] = { documents: 0, words: 0 }
            }

            if (page.category) {

                categoryStats[page.category].documents++;
                categoryStats[page.category].words += page.wordCount;
            }
        }

    }

    for (let category of Object.values(categoryStats)) {
        category["avg"] = category.words / category.documents;
    }

    let stats = {
        totalWords,
        docCount,
        byCategory: categoryStats,
        byDate: dateStats,
        avgWords: totalWords / docCount,
        medianWords: findMedian(wordCounts)
    };

    if (!fs.existsSync(directories(outputPath))) {
        fs.mkdirSync(directories(outputPath), { recursive: true })
    }

    await writeFile(outputPath, JSON.stringify(stats), { flag: "w+" });

    console.log({stats, outputPath});


}

function findMedian(arr) {
    arr.sort((a, b) => a - b);
    const middleIndex = Math.floor(arr.length / 2);

    if (arr.length % 2 === 0) {
        return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
    } else {
        return arr[middleIndex];
    }
}