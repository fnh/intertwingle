import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { directories } from "../utils/directories.js";

const INTERTWINGLE = "intertwingle";

export async function applyPlugins({
    templateDom,
    page,
    metamodel
}) {
    let document = templateDom.window.document;

    let pluginElements = [...document.getElementsByTagName(INTERTWINGLE)];

    for (let pluginElement of pluginElements) {
        await applyPlugin({
            pluginElement,
            templateDom,
            page,
            metamodel
        });
    }
}

async function applyPlugin({
    pluginElement,
    templateDom,
    page,
    metamodel
}) {
    let pluginName = pluginElement.getAttribute("plugin");

    let pluginParams = getPluginParams(pluginElement);

    // todo allow for non-built-in plugin, maybe even in script tags?!

    let pluginImport = () => {
        let pluginPath = `../plugins/${pluginName}.js`;

        if (pluginElement.getAttribute("path")) {
            // for custom plugins,
            // attribute "path" is assumed to be relative
            // to the input directory of page
            
            pluginPath =
                path.join(
                    __dirname, 
                    "..",
                    directories(page.filename),
                    `${pluginElement.getAttribute("path")}${pluginName}.js`
                );
        }
        return import(pluginPath);
    }

    try {
        const { default: pluginFn } = await pluginImport();

        if (pluginElement.getAttribute("executed") !== "true") {

            pluginElement.setAttribute("executed", "true")

            await pluginFn({
                templateDom,
                page,
                metamodel,
                pluginParams,
                pluginElement,
            });
        } else {
            console.log(`${pluginName} already executed`);
        }
    } catch (e) {
        console.log(`Executing plugin ${pluginName} failed.`)
        console.error(e);
    }
}

function getPluginParams(pluginTag) {
    let params = {};

    for (let attr of pluginTag.getAttributeNames().filter(x => x !== "plugin")) {
        params[attr] = pluginTag.getAttribute(attr);
    }

    return params;
}