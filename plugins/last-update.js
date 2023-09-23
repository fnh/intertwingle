export default async function lastUpdatedPage({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const reverseChronologically =
        (a, b) => b.publicationDate?.localeCompare(a.publicationDate)

    let [latest] =
        metamodel.pages
            .filter(page => page.isPublished && page.publicationDate)
            .sort(reverseChronologically);

    const path = new URL(latest.fullQualifiedURL).pathname;
    let content =
        `<a href="${path}">${latest.title}</a> (<time datetime="${latest.publicationDate}" id="lastUpdatedAt">${latest.publicationDate}</time>)`

    pluginElement.insertAdjacentHTML("afterend", content);
    pluginElement.remove();
}