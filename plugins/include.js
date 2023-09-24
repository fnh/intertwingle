export default async function includeFile({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let fileName = pluginParams.file;
    const included = metamodel.pages.find(p => p.filename?.replace(p.inputDirectory, "") === fileName);

    if (!included) {
        console.warn(`include ${fileName} not found`)
    } else {
        let content = included.fileContent;
        pluginElement.insertAdjacentHTML("afterend", content);
    }

    pluginElement.remove();
}