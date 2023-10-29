import { writeFile } from "node:fs/promises";
import * as fs from 'fs';
import path from "path";

import { classifyElements } from "../core/create-model.js";
import { directories, normUrl } from "../utils/directories.js"
import { listify } from "../utils/listify.js"

function normalize(page) {
    return {
        title: page.title,
        url: normUrl(page.fullQualifiedURL)
    }
}

export default async function contentGraph({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let outputFile = pluginParams.filename;
    let categories =
        listify(pluginParams.category);

    let { contentPages } = classifyElements(metamodel);

    const isCandidate =
        categories.length
            ? p => categories.some(category => p.category == category)
            : () => true;

    const pages = contentPages.filter(page => page.isPublished && isCandidate(page));

    const toInternalLinks = page => {
        const isSame = (url) => p => normUrl(p.fullQualifiedURL) === normUrl(url);

        const targetNodes = page.links.internal
            .map((url) => {
                const page = pages.find(isSame(url));
                return page ? normalize(page) : null;
            })
            .filter(x => x); // edges without target node are not allowed
        const edge = from => to => {
            return { from, to };
        };
        const from = normalize(page);
        const toEdge = edge(from);

        return targetNodes.map(toEdge);
    };

    const internalLinks =
        pages.map(toInternalLinks).flat();



    const outpath = path.join(page.outdir, outputFile);

    if (!fs.existsSync(directories(outpath))) {
        fs.mkdirSync(directories(outpath), { recursive: true })
    }

    const graph = toCytoscapeGraph({ pages, internalLinks });
    await writeFile(outpath, JSON.stringify(graph, null, "\t"));

    pluginElement.remove();
}


function toCytoscapeGraph({ pages, internalLinks }) {

    const nodes =
        pages.map(page => normalize(page)).map(toCytoscapeNode);

    const edges = internalLinks.map(toCytoscapeEdge);

    return {
        elements: {
            nodes,
            edges
        }
    };
}

const toCytoscapeNode = normalizedPage => {
    return {
        data: {
            id: normalizedPage.url,
            title: normalizedPage.title || normalizedPage.url
        }
    };
};

const toCytoscapeEdge = link => {
    return {
        data: {
            id: link.from.url + "---" + link.to.url,
            source: link.from.url,
            target: link.to.url
        }
    };
};
