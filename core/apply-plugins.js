const INTERTWINGLE = "intertwingle";

function getPluginParams(pluginTag) {
    let params = {};

    for (let attr of pluginTag.getAttributeNames().filter(x => x !== "plugin")) {
        params[attr] = pluginTag.getAttribute(attr);
    }

    return params;
}

async function applyPlugin({
    pluginElement,
    templateDom,
    page,
    metamodel
}) {
    let pluginName = pluginElement.getAttribute("plugin");

    let pluginParams = getPluginParams(pluginElement);

    let pluginImport = () => import(`../plugins/${pluginName}.js`)

    try {
        const { default: pluginFn } = await pluginImport();

        if (pluginElement.getAttribute("executed") !== "true") {

            pluginElement.setAttribute("executed", "true")

            await pluginFn({
                templateDom,
                page,
                metamodel,
                pluginParams,
                pluginElement,
            });
        } else {
            console.log("already executed")
        }



    } catch (e) {
        console.log(`Executing plugin ${pluginName} failed.`)
        console.error(e);
    }
}

export async function applyPlugins({
    templateDom,
    page,
    metamodel
}) {
    let document = templateDom.window.document;

    let pluginElements = [...document.getElementsByTagName(INTERTWINGLE)];

    for (let pluginElement of pluginElements) {
        await applyPlugin({
            pluginElement,
            templateDom,
            page,
            metamodel
        });
    }
}