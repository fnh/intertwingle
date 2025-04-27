export function htmlToElements(html: string, document: Document) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.childNodes;
}