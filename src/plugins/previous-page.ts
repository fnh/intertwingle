export default async function addPreviousPage({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {

    let targetSelector = pluginParams.target || "article";

    let linkText = pluginParams["link-text"];

    let pages = metamodel.pages.filter(p => p.category === page.category && p.isPublished && p.publicationDate);

    let byDateAsc = (a, b) => new Date(a.publicationDate) - new Date(b.publicationDate);
    pages.sort(byDateAsc);

    let pageIndex = pages.findIndex(p => p.fullQualifiedURL === page.fullQualifiedURL);

    if (pageIndex > 0) {
        let previousPage = pages[pageIndex - 1];
        let document = templateDom.window.document;
        let slot = document.querySelector(targetSelector);

        if (!slot) {
            slot = pluginElement.parentElement;
        }

        let previous = document.createElement("a");
        let href = new URL(previousPage.fullQualifiedURL).pathname;
        previous.href = href;
        previous.innerHTML = linkText || previousPage.title;

        slot.appendChild(previous);
    } else {
        // The first page has no predecessor
        // console.log({noPredecessor: page})
    }

    pluginElement.remove();
}