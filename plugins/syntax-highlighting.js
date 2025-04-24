import { readFile } from "node:fs/promises";

import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import prism from 'prismjs';
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-java.js";
const { highlight, languages } = prism;


export default async function addSyntaxHighlighting({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let language = pluginParams.language || "javascript";

    const preformatted = pluginElement.querySelector("pre");

    let code;
    let addPre = !!preformatted;
    if (preformatted) {
        code = preformatted.textContent;
    } else {
        if (language != "html") {
            code = pluginElement.textContent;
        } else {
            code = pluginElement.innerHTML;
        }
    }
    
    const highlightedCode =
        highlight(code, languages[language], language);
        
    let document = templateDom.window.document;

    // inject style
    const pathToCss = path.join(__dirname, "../node_modules/prismjs/themes/prism.min.css");
    const styles = await readFile(pathToCss, { encoding: "utf-8" });
    const prismMinStyles = document.createElement("style");
    prismMinStyles.innerHTML = styles;
    document.head.appendChild(prismMinStyles);

    let html = addPre ? `<pre>${highlightedCode}</pre>` : highlightedCode;
    
    pluginElement.insertAdjacentHTML("afterend", html);

    pluginElement.remove();
}
