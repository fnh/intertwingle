export default async function toListItems({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const list = pluginElement.textContent;
    
    let items = list.split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("*"))
        .map(line => `<li>${line.slice(1)}</li>`)
        .join("\n");    
    
    pluginElement.insertAdjacentHTML("afterend", items);
    pluginElement.remove();
}
