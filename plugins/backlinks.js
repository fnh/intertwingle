import { listify } from "../utils/listify.js";

export default async function addBacklinks({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let categories = listify(pluginParams.category);

    let targetSelector = pluginParams.target || "article";

    if (categories.some(category => category === page.category) && page.backlinks.length) {
        let document = templateDom.window.document;
        let slot = document.querySelector(targetSelector);

        let backlinksNav = document.createElement("div");
        let ul = document.createElement("ul");

        for (let backlink of page.backlinks) {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.href = new URL(backlink.url).pathname;
            a.innerHTML = backlink.title;
            li.appendChild(a);
            ul.appendChild(li);
        }

        backlinksNav.appendChild(document.createTextNode("Pages which link here:"))
        backlinksNav.appendChild(ul);
        slot.appendChild(document.createElement("hr"));
        slot.appendChild(backlinksNav);
    }

    pluginElement.remove();
}