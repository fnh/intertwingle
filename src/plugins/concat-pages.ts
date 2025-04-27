// import { PluginArgument } from "../core/apply-plugins";
import { classifyElements } from "../core/create-model"
import { PageModelExtended } from "../types/model";
import { listify } from "../utils/listify"

export default async function concatPages({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}: PluginArgument) {
    let { contentPages } = classifyElements(metamodel);

    const categories = listify(pluginParams.category);

    const chronologically =
        (a: PageModelExtended, b: PageModelExtended) => a.publicationDate?.localeCompare(b.publicationDate || "") ?? 0

    const content =
        contentPages
            .filter(page => categories.some(c => c == page.category))
            .sort(chronologically)
            .map(page => page.fileContent)
            .join("\n");

    pluginElement.insertAdjacentHTML("afterend", content);

    pluginElement.remove();
}

