import jsdom from "jsdom";
import path from "path";
const { JSDOM } = jsdom;
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function addContent(templateDom, page, globalProperties) {

    console.log("adding content to template")

    let document = templateDom.window.document;

    let mainContentSlots = [...document.getElementsByTagName("intertwingle")].filter(el => el.getAttribute("plugin") === "main-content");

    for (let mainContentSlot of mainContentSlots) {
        const pathName = path.resolve(__dirname, "..", page.filename);

        let content = await readFile(pathName, { encoding: "utf-8" });

        console.log(pathName)
        //let contentDom = new JSDOM(content, { url: globalProperties.url });

        mainContentSlot.insertAdjacentHTML("afterend", content);

        mainContentSlot.remove();


        //console.log(contentDom.window.document.body.innerHTML)
        //insertAfter(mainContentSlot, contentDom.window.document.body.firstElementChild);
    }

    
    return null;
}