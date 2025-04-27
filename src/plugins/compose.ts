import { type PluginArgument } from "../types/model.ts";

export default async function compose({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}: PluginArgument) {
    let targetSelector = pluginParams.insertafter;

    let position = pluginParams.position ?? "afterend";

    const content = pluginElement.innerHTML;

    let document = templateDom.window.document;

    let target = document.querySelector(targetSelector);

    if (!targetSelector) {
        target = pluginElement.parentElement;
    }

    if (target) {
        target.insertAdjacentHTML(position, content);
    } else {
        console.warn("Target ", targetSelector, " not found in ", page.fullQualifiedURL)
    }

    pluginElement.remove();
}


