export default async function createTitle(templateDom, page, globalProperties) {
    const pageTitle = page.title ? page.title + " - " : "";
    let title = pageTitle + globalProperties.title;
    templateDom.window.document.title = title;
}