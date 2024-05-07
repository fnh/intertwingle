export default async function compose({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    let targetSelector = pluginParams.insertafter;

    const content = pluginElement.innerHTML;
    
    let document = templateDom.window.document;

    let target = document.querySelector(targetSelector);

    if (!targetSelector) {
        target = pluginElement.parentElement;
    }

    if (target) {
        target.insertAdjacentHTML("afterend", content);
    } else {
        console.warn("Target ", targetSelector, " not found in ", page.fullQualifiedURL)
    }

    pluginElement.remove();
}


