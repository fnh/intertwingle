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

    const isListed = page => page.category === pluginParams.category && page.isPublished;

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
    const tbody = table.getElementsByTagName("tbody").item(0);

    for (let row of rows) {
        tbody.appendChild(row);
    }

    pluginElement.remove();
}