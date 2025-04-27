import jsdom from "jsdom";

const { JSDOM } = jsdom;

export type DocumentObjectModel = {
    window: Window,
    document: Document,
    serialize(): string
}

export function toDom({ html, baseUrl }): DocumentObjectModel {
    const jsdom = new JSDOM(html, { url: baseUrl })

    return {
        window: jsdom.window as unknown as Window,
        document: jsdom.window.document as Document,
        serialize: () => jsdom.serialize()
    };
}