import { writeFile } from "node:fs/promises";
import * as fs from 'fs';
import path from "path";

import lunr from "lunr";

import { classifyElements } from "../core/create-model.js";
import { directories } from "../utils/directories.js"
import { listify } from "../utils/listify.js"


export default async function buildLunrIndex({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let indexOutputFile = pluginParams.indexfile;

    let categories =
        listify(pluginParams.category);

    let { contentPages } = classifyElements(metamodel);

    const isCandidate =
        categories.length
            ? p => categories.some(category => p.category == category)
            : () => true;

    const pages = 
        contentPages
            .filter(isCandidate)
            .filter(p => p.isPublished);

    let titleLookup = {}

    let lunrIndex = lunr(function () {
        this.ref("fullQualifiedURL")
        this.field("title")
        this.field("textContent")

        pages.forEach((doc) => {
            this.add(doc);
            titleLookup[doc.fullQualifiedURL] = doc.title;
        });
    })

    const lunrWithIdLookup = JSON.stringify({ lunrIndex, idToTitle: titleLookup });

    const outpath = path.join(page.outdir, indexOutputFile);

    if (!fs.existsSync(directories(outpath))) {
        fs.mkdirSync(directories(outpath), { recursive: true })
    }

    await writeFile(outpath, lunrWithIdLookup);

    pluginElement.remove();
}
