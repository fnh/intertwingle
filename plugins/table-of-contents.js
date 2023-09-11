import { htmlToElements } from "../utils/html-to-elements.js";

export default async function tableOfContents({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const table =
        templateDom.window.document.getElementById(pluginParams.target);

    const isListedCategory = page => page.category === pluginParams.category && page.isPublished;

    let listedTopics = (pluginParams.topics || "").split(",").map(t => t.trim()).filter(t => t);

    const isListedTopic = page => {
        return page.isPublished
            && listedTopics.some(listedTopic => page.topics.includes(listedTopic));
    }

    let isListed = () => false;

    if (pluginParams.category) {
        isListed = isListedCategory;
    } else if (pluginParams.topics) {
        isListed = isListedTopic;
    }

    const reverseChronologically =
        (a, b) => b.publicationDate.localeCompare(a.publicationDate)

    const toRow = page => `<tr><td>${page.publicationDate}</td><td><a href="${page.fullQualifiedURL}">${page.title}</a></td></tr>`;

    const content =
        metamodel.pages
            .filter(isListed)
            .sort(reverseChronologically)
            .map(toRow)
            .join("");

    const rows = [...htmlToElements(content, templateDom.window.document)];

    let tbody = table.getElementsByTagName("tbody").item(0);

    if (!tbody) {
        tbody = templateDom.window.document.createElement("tbody");
        table.appendChild(tbody);
    }

    for (let row of rows) {
        tbody.appendChild(row);
    }

    pluginElement.remove();
}