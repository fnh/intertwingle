function isNonBlank(str: string): boolean {
    return str.trim().length > 0;
};

export function wordCount(document: Document) {
    const textContent = document.body.textContent?.trim() || "";
    return countWord(textContent);
}

export function countWord(text: string) {
    const tokens = text.split(" ").filter(isNonBlank);

    return tokens.length;
}