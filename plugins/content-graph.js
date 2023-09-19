import { writeFile } from "node:fs/promises";
import * as fs from 'fs';
import path from "path";

import { classifyElements } from "../core/create-model.js";
import { directories, directoryWhenIndex } from "../utils/directories.js"

let normUrl = url => {
    const cleanUrl = directoryWhenIndex(url);
    const isCleanEnough =
        cleanUrl.endsWith(".html") || cleanUrl.endsWith("/");

    return isCleanEnough ? cleanUrl : cleanUrl + "/";
}

export default async function contentGraph({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let outputFile = pluginParams.filename;

    let { contentPages } = classifyElements(metamodel);

    const normalize = (p) => {
        return { title: p.title, url: normUrl(p.fullQualifiedURL) }
    }

    const isCandidate = p => p.category == "articles" || p.category == "weeknotes";
    const candidatePages = contentPages.filter(isCandidate);

    const internalLinks =
        candidatePages
            .map(p => {
                const isSame =
                    (url) => p => normUrl(p.fullQualifiedURL) === normUrl(url);

                let targets = p.links.internal
                    .map((url) => {
                        const page = contentPages.find(isSame(url));
                        
                        if (page && isCandidate(page)) {
                            return normalize(page);
                        } else {
                            return null;
                        }
                    })
                    .filter(x => x);

                let from = normalize(p);

                return targets.map(to => {
                    return { from, to }
                });
            })
            .flat();

    let nodesLUT = {};

    for (let link of internalLinks) {
        nodesLUT[link.from.url] = link.from;
        nodesLUT[link.to.url] = link.to;
    }

    const nodes = //Object.values(nodesLUT)

        candidatePages.map(page => normalize(page))
            .map(page => {
                return {
                    data: { id: page.url, title: page.title }
                };
            });


    const edges = internalLinks.map(link => {
        return {
            data: {
                id: link.from.url + "---" + link.to.url,
                source: link.from.url,
                target: link.to.url
            }
        }
    })

    let cytoscapeGraph = {
        elements: { nodes, edges }
    }

    const outpath = path.join(page.outdir, outputFile);

    if (!fs.existsSync(directories(outpath))) {
        fs.mkdirSync(directories(outpath), { recursive: true })
    }

    await writeFile(outpath, JSON.stringify(cytoscapeGraph, null, "\t"))

    pluginElement.remove();
}