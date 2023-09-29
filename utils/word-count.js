function isNonBlank(str) {
    return str.trim().length
};

export function wordCount(document) {
    const textContent = (document.body.textContent.trim() || "");

    const tokens = textContent.split(" ").filter(isNonBlank);

    return tokens.length;
}