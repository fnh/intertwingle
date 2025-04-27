export default async function wordCount({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let content = `<time>${page.publicationDate}</time>`;
    pluginElement.insertAdjacentHTML("afterend", content)
    pluginElement.remove();
}