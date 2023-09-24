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
    let targets = [...document.getElementsByTagName(targetSelector)];

    if (targets.length) {
        targets[0].insertAdjacentHTML("afterend", content)

    }
    pluginElement.remove();
}


