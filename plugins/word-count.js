export default async function wordCount({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let content = `<span>${page.wordCount}</span>`;
    pluginElement.insertAdjacentHTML("afterend", content)
    pluginElement.remove();
}


