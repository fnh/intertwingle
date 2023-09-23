import { classifyElements } from "../core/create-model.js"
import { listify } from "../utils/listify.js"

export default async function concatPages({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let { contentPages } = classifyElements(metamodel);

    const categories = listify(pluginParams.category);

    const chronologically =
        (a, b) => a.publicationDate.localeCompare(b.publicationDate)

    const content =
        contentPages
            .filter(page => categories.some(c => c == page.category))
            .sort(chronologically)
            .map(page => page.fileContent)
            .join("\n");

    pluginElement.insertAdjacentHTML("afterend", content);

    pluginElement.remove();
}

