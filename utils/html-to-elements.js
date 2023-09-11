export function htmlToElements(html, document) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.childNodes;
}