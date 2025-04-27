import temml from "temml";
const {renderToString} = temml;

export default async function convertTeXToMathML({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const tex = pluginElement.textContent;
    const mathML = renderToString(tex);

    pluginElement.insertAdjacentHTML("afterend", mathML);
    pluginElement.remove();
}
