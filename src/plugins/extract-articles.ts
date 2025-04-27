import type { PluginArgument } from "../core/apply-plugins.ts";
import { toDom } from "../core/dom-adapter.ts";
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

    for (let item of items) {
        let articleModel = { ...page }
        articleModel.publicationDate = item.querySelector("time").dateTime;
        articleModel.outputPath = `${outputPath}/${item.id}/index.html`;
        // articleModel.title = "Note from " + articleModel.publicationDate;
        // let h = document.createElement("h1");
        // h.textContent = articleModel.title
        // item.prepend(h)
        articleModel.fileContent = item.outerHTML;
        articleModel.template = "note";

        articleModel.wordCount = countWord(articleModel.fileContent)
        articleModel.backlinks = [];
        articleModel.fullQualifiedURL = model.globalProperties.url + pluginParams.filename + `${item.id}/`;
        metamodel.pages.push(articleModel);

    }


    pluginElement.remove();
}