import { readFile, writeFile } from "node:fs/promises";
import jsdom from "jsdom";

const { JSDOM } = jsdom;

const xmlPreamble = `<?xml version="1.0" encoding="utf-8"?>`;

const rss = (channel) => `<rss version="2.0">${channel}</rss>`

const titleElement = (title) => `<title>${title}</title>`

const linkElement = (link) => `<link>${link}</link>`

const descriptionElement = (description) => `<description>${description}</description>`

const itemElement = (item) => `<item>${item}</item>`

const pubDate = (date) => `<pubDate>${(new Date(date)).toUTCString()}</pubDate>`

const guid = (id, isPermaLink = false) => `<guid isPermaLink="${isPermaLink}">${id}</guid>`

const cdata = (characters) => {
    const TERMINATION = "]]>";
    if (characters.includes(TERMINATION)) {
        let index = characters.indexOf(TERMINATION) + 2;
        const before = characters.slice(0, index);
        const after = characters.slice(index);
        return `${cdata(before)}${cdata(after)}`
    } else {
        return `<![CDATA[${characters}]]>`
    }
}

const channel = ({ title, link, description, items }) => {
    return `<channel>${titleElement(title)}${linkElement(link)}${descriptionElement(description)}${items}</channel>`
}

const toItem = async (page, model) => {

    const title = page.title;

    let description = page.title; // fallback

    const content = await readFile(page.filename, { encoding: "utf-8" });


    let contentDom = new JSDOM(content, { url: model.globalProperties.url });

    let [article] = [...contentDom.window.document.getElementsByTagName("article")]
    if (article) {
        const copy = article.cloneNode(true);
        copy.removeChild(copy.getElementsByTagName("h1")[0])
        description = cdata(copy.innerHTML.trim());
    }

    const permaLink = page.fullQualifiedURL;

    const publicationDate = page.publicationDate;

    if (!title || !publicationDate) console.log(page);

    return itemElement(
        titleElement(cdata(title))
        + descriptionElement(description)
        + pubDate(publicationDate)
        + guid(permaLink, true)
    )
}

async function toFeed(model, items, description) {

    let feedItems = [];

    for (let page of items) {
        let theItem = await toItem(page, model);
        feedItems.push(theItem);
    }

    const feed = {
        description,
        link: model.globalProperties.url,
        title: cdata(model.globalProperties.title),
        items: feedItems.join("\n")
    }

    return xmlPreamble + rss(channel(feed));

}

export default async function createRssFeed(
    templateDom,
    page,
    globalProperties,
    model,
    params,
) {

    let categories = params.categories.split(",");

    let description = params.description;

    let outdir = page.outdir.endsWith("/") ? page.outdir : page.outdir + "/";
    let outputPath = outdir + params.filename;

    const reverseChronologically =
        (a, b) => b.publicationDate.localeCompare(a.publicationDate)

    const items =
        model.pages
            .filter(page => page.isPublished && categories.includes(page.category))
            .sort(reverseChronologically);

    const feed = await toFeed(model, items, description);

    await writeFile(outputPath, feed)
}