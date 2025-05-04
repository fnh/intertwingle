import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { directories } from "../utils/directories.ts";
import type { PageModelExtended, WebsiteModel } from "../types/model.ts";
import type { DocumentObjectModel } from "./dom-adapter.ts";

const INTERTWINGLE = "intertwingle";

export async function applyPlugins({
    templateDom,
    page,
    metamodel
}: {
    templateDom: DocumentObjectModel,
    page: PageModelExtended,
    metamodel: WebsiteModel
}) {
    let document = templateDom.window.document;

    let pluginElements: Array<Element> = [...document.getElementsByTagName(INTERTWINGLE)];

    for (let pluginElement of pluginElements) {
        if (pluginElement.getAttribute("plugin")) {
            await applyPlugin({
                pluginElement,
                templateDom,
                page,
                metamodel
            });
        }
    }
}

export type ApplyPluginArgument = {
    pluginElement: Element,
    templateDom: DocumentObjectModel,
    page: PageModelExtended,
    metamodel: WebsiteModel,
}

export type PluginArgument = ApplyPluginArgument & {
    pluginParams: PluginParams,
}

async function applyPlugin({
    pluginElement,
    templateDom,
    page,
    metamodel
}: ApplyPluginArgument) {
    let pluginName = pluginElement.getAttribute("plugin");

    let pluginParams = getPluginParams(pluginElement);


    //https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html
    let pluginImport = () => {
        let pluginPath = `../plugins/${pluginName}.ts`;

        let customPluginPath = pluginElement.getAttribute("path");
        if (customPluginPath) {
            if (customPluginPath.startsWith("/")) {
                // path is starting from the root input directory
                pluginPath =
                    path.join(
                        page.inputDirectory,
                        `${customPluginPath}${pluginName}.js`
                    );
            } else {
                // path is relative to the directory of current page
                pluginPath =
                    path.join(
                        __dirname,
                        "..",
                        directories(page.filename),
                        `${customPluginPath}${pluginName}.js`
                    );
            }
        }

        return import(pluginPath);
    }

    try {
        const { default: pluginFn } = await pluginImport();

        if (pluginElement.getAttribute("executed") !== "true") {

            pluginElement.setAttribute("executed", "true")

            let pluginArgs: PluginArgument = {
                templateDom,
                page,
                metamodel,
                pluginParams,
                pluginElement,
            }

            await pluginFn(pluginArgs);
        } else {
            // console.log(`${pluginName} already executed`);
        }
    } catch (e) {
        console.log(`Executing plugin ${pluginName} failed.`)
        console.error(e);
    }
}

type PluginParams = { [key in string]: string }

function getPluginParams(pluginTag: Element): PluginParams {
    let params = {};

    for (let attr of pluginTag.getAttributeNames().filter(x => x !== "plugin")) {
        params[attr] = pluginTag.getAttribute(attr);
    }

    return params;
}