import { directoryWhenIndex } from "../utils/directories.js";
import { listify } from "../utils/listify.js";

export default async function pagesAsJson({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const isListedCategory = page => page.isPublished
        && listify(pluginParams.category).some(c => c == page.category);

    const isListedTopic = page => {
        let listedTopics = listify(pluginParams.topics);

        return page.isPublished
            && listedTopics.some(listedTopic => page.topics.includes(listedTopic));
    }

    let isListed = () => false;

    if (pluginParams.category) {
        isListed = isListedCategory;
    } else if (pluginParams.topics) {
        isListed = isListedTopic;
    }

    console.log(metamodel.globalProperties)

    let toRelativeUrl =
        page =>
            directoryWhenIndex(page.fullQualifiedURL)
                .replace(metamodel.globalProperties.url, "");

    const pagesAsJson =
        metamodel.pages
            .filter(isListed)
            .map(toRelativeUrl);

    let script = `<script>let pageList=${JSON.stringify(pagesAsJson)};</script>`

    pluginElement.insertAdjacentHTML("afterend", script)

    pluginElement.remove();
}