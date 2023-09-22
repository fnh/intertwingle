import prism from 'prismjs';
import { readFile } from "node:fs/promises";
import path from "path";

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const { highlight, languages } = prism;

export default async function example({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const code = pluginElement.textContent;
    const language = pluginElement.language || "javascript";

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
