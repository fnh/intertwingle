export default async function addNextPage({
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

    if ((pageIndex + 1) < pages.length) {
        let nextPage = pages[pageIndex + 1];
        let document = templateDom.window.document;
        let slot = document.querySelector(targetSelector);

        if (!slot) {
            slot = pluginElement.parentElement;
        }

        let next = document.createElement("a");
        let href = new URL(nextPage.fullQualifiedURL).pathname;
        next.href = href;
        next.innerHTML = linkText || `${nextPage.title}`;

        slot.appendChild(next);
    } else {
        console.log("This is the last page it has no succesor");
    }


    pluginElement.remove();
}