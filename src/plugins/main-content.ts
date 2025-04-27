export default async function addContent({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let content = page.fileContent;
    pluginElement.insertAdjacentHTML("afterend", content);
    pluginElement.remove();
}