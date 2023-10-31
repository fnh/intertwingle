import { readFile } from "node:fs/promises";

import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import prism from 'prismjs';
const { highlight, languages } = prism;

export default async function addSyntaxHighlighting({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const language = pluginParams.language || "javascript";
    console.log(language)
    const code = language != "html" ? pluginElement.textContent : pluginElement.innerHTML;

    console.log(code);

    const highlightedCode =
        highlight(code, languages[language], language);

    let document = templateDom.window.document;

    // inject style
    const pathToCss = path.join(__dirname, "../node_modules/prismjs/themes/prism.min.css");
    const styles = await readFile(pathToCss, { encoding: "utf-8" });
    const prismMinStyles = document.createElement("style");
    prismMinStyles.innerHTML = styles;
    document.head.appendChild(prismMinStyles);

    pluginElement.insertAdjacentHTML("afterend", highlightedCode);

    pluginElement.remove();
}
