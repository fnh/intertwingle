import * as fs from 'fs';
import { writeFile } from "node:fs/promises";
import jsdom from "jsdom";

const { JSDOM } = jsdom;

import { directories } from "../utils/directories.ts";

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

const toItem = async (page) => {
    const publicationDate = page.getElementsByTagName("time").item(0).dateTime;

    //console.log({page, publicationDate})
   
    const title = "Note from " + publicationDate;
    let description = cdata(page.innerHTML.trim());
    return itemElement(
        titleElement(cdata(title))
        + descriptionElement(description)
        + pubDate(publicationDate)
    );
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

export default async function extractRssFeed({
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let model = metamodel;
    let params = pluginParams;

    let description = params.description;

    let outdir = page.outdir.endsWith("/") ? page.outdir : page.outdir + "/";
    let outputPath = outdir + params.filename;

    let contentDom = new JSDOM(page.fileContent, { url: model.globalProperties.url });

    let document = contentDom.window.document;

    const items =
        [...document.getElementsByTagName("article")];

    const feed = await toFeed(
        model, 
        items, 
        description
    );

    if (!fs.existsSync(directories(outputPath))) {
        fs.mkdirSync(directories(outputPath), { recursive: true })
    }

    await writeFile(outputPath, feed, {flag:"w+"});

    pluginElement.remove();
}