import type { PluginArgument } from "../core/apply-plugins.ts";
import { toDom } from "../core/dom-adapter.ts";
import type { PageModelExtended } from "../types/model.js";
import { countWord } from "../utils/word-count.ts";


export default async function extractArticles({
    page,
    metamodel,
    pluginParams,
    pluginElement,

}: PluginArgument) {
    let model = metamodel;

    let contentDom = toDom({ html: page.fileContent, baseUrl: model.globalProperties.url });

    let document = contentDom.window.document;

    const items =
        [...document.getElementsByTagName("article")];

    let outdir = page.outdir.endsWith("/") ? page.outdir : page.outdir + "/";
    let outputPath = outdir + pluginParams.filename;

    let pagesToAdd: Array<PageModelExtended> = [];

    for (let item of items) {
        let articleModel = { ...page }
        articleModel.publicationDate = item.querySelector("time").dateTime;
        articleModel.outputPath = `${outputPath}/${item.id}/index.html`;
        
        articleModel.filename = `${item.id}/index.html`;

        let formattedDate = new Intl.DateTimeFormat("en-GB", {
            dateStyle: "long",
            timeZone: "Europe/Berlin",
        }).format(new Date(articleModel.publicationDate));

        articleModel.title = `Notes (${formattedDate})`;
        articleModel.template = "note";

        articleModel.fileContent = item.outerHTML;
        articleModel.wordCount = countWord(item.outerHTML);
        articleModel.backlinks = [];
        articleModel.fullQualifiedURL = model.globalProperties.url + pluginParams.filename + `${item.id}/`;
        pagesToAdd.push(articleModel);
    }

    for (let pageToAdd of pagesToAdd) {
        if (!metamodel.pages.some(p => p.fullQualifiedURL === pageToAdd.fullQualifiedURL)) {
            page.changedModel = true;
            metamodel.pages.push(pageToAdd);
        }
    }    
    
    pluginElement.remove();
}