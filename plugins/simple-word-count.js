export  function simpleWordCount(document, args) {
    let d = document;

    const textContent = (d.body.textContent.trim() || "");
    const tokenizedText = textContent.split(" ").filter(token => token.trim().length);
    let simpleWordCount = tokenizedText.length;

    return {wordCount: simpleWordCount};
}