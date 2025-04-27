import path from "path";

export default async function includeFile({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    if (!pluginParams.file) {
        return;
    }

    const includedFilename = path.join(page.inputDirectory, pluginParams.file);
    const included = metamodel.pages.find(p => p.filename === includedFilename);

    if (!included) {
        console.warn(`include ${fileName} not found`)
        console.log(page);
    } else {
        pluginElement.insertAdjacentHTML("afterend", included.fileContent);
    }

    pluginElement.remove();
}