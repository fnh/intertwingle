import {listify} from "../utils/listify.js";

export default async function lastUpdatedPage({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let categories = listify(pluginParams["category"]);

    const reverseChronologically =
        (a, b) => b.publicationDate?.localeCompare(a.publicationDate)

    let [latest] =
        metamodel.pages
            .filter(page => page.isPublished && page.publicationDate)
            .filter(page => categories.length ? categories.includes(page.category) : true)
            .sort(reverseChronologically);

    const path = new URL(latest.fullQualifiedURL).pathname;
    let content =
        `<a href="${path}">${latest.title}</a> (<time datetime="${latest.publicationDate}" id="lastUpdatedAt">${latest.publicationDate}</time>)`

    pluginElement.insertAdjacentHTML("afterend", content);
    pluginElement.remove();
}