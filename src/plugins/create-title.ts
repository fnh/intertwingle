// import { PluginArgument } from "../core/apply-plugins";

export default async function createTitle({
    templateDom,
    page,
    metamodel,
    pluginElement,
}: PluginArgument) {
    const pageTitle = page.title ? page.title + " - " : "";
    let title = pageTitle + metamodel.globalProperties.title;
    templateDom.window.document.title = title;
    pluginElement.remove();
}