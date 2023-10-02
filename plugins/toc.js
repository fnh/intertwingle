import {last} from "../utils/array.js";

export default async function createTableOfContents({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let parent = pluginElement.parentElement;

    let children = [...parent.children];

    let autoIdCounter = 0;

    let sections = [];

    for (let element of children) {
        if (element.tagName == "H2") {
            let id = element.id || `it-toc-auto-id-${autoIdCounter++}`;
            element.id = id;

            const section = {
                id,
                title: element.textContent.trim(),
                subsections: []
            };

            sections.push(section)
        }
        if (element.tagName == "H3") {
            let id = element.id || `it.toc-auto-id-${autoIdCounter++}`;
            element.id = id;

            const subsectionItem = { id, title: element.textContent.trim() };
            last(sections).subsections.push(subsectionItem);
        }
    }

    let list = sections.map((s) => renderSection(s)).join("");

    let tableOfContent = `<ul class="intertwingle-toc">${list}</ul>`;

    pluginElement.insertAdjacentHTML("afterend", tableOfContent);

    pluginElement.remove();
}

function renderSection(section) {
    console.log(section)
    return `
        <li><a href="#${section.id}">${section.title}</a>${renderSubsections(section)}</li>
    `
}

function renderSubsections(section) {
    if (!section.subsections.length) {
        return "";
    }
    return `<ul class="intertwingle-toc">${section.subsections.map(renderTitle).join("")}</ul>`;
}

function renderTitle(section) {
    return `<li><a href="#${section.id}">${section.title}</a></li>`;

}