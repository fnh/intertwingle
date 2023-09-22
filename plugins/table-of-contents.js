import { htmlToElements } from "../utils/html-to-elements.js";
import { directoryWhenIndex } from "../utils/directories.js";
import { listify } from "../utils/listify.js";

function toRow(page) {
    const url =
        new URL(directoryWhenIndex(page.fullQualifiedURL));

    const formatedDate = page.publicationDate.split(" ")[0];
    return `
<tr>
    <td><time datetime="${page.publicationDate}">${formatedDate}</time></td>
    <td>
        <a href="${url.pathname}">${page.title}</a>
    </td>
</tr>`;
}

export default async function tableOfContents({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const table =
        templateDom.window.document.getElementById(pluginParams.target);

    const isListedCategory = page => listify(pluginParams.category).some(cat => cat === page.category) && page.isPublished;


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

    const reverseChronologically =
        (a, b) => b.publicationDate.localeCompare(a.publicationDate)

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