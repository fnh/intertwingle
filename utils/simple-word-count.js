function isNonBlank(str) {
    return str.trim().length
};

export function simpleWordCount(document) {
    const textContent = (document.body.textContent.trim() || "");
    
    const tokens = textContent.split(" ").filter(isNonBlank);

    return { wordCount: tokens.length };
}