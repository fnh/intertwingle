export default async function example(templateDom, page, globalProperties) {
    const pageTitle = page.title ? page.title + " - " : "";
    let title = pageTitle + globalProperties.title;
    templateDom.window.document.title = title;
}