import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function addContent(templateDom, page, globalProperties) {
    let document = templateDom.window.document;

    let mainContentSlots = [...document.getElementsByTagName("intertwingle")].filter(el => el.getAttribute("plugin") === "main-content");

    for (let mainContentSlot of mainContentSlots) {
        const pathName = path.resolve(__dirname, "..", page.filename);

        let content = await readFile(pathName, { encoding: "utf-8" });

        mainContentSlot.insertAdjacentHTML("afterend", content);

        mainContentSlot.remove();
    }

    return null;
}