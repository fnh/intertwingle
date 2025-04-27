const ASSUMED_WORDS_PER_MINUTE = 240;

export default async function estimatedReadingTime({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const wordsPerMinute = pluginParams.wordsPerMinute ||  ASSUMED_WORDS_PER_MINUTE

    const estimate =
        Math.ceil(page.wordCount / wordsPerMinute);

    let content = `<span>${estimate}</span>`;
    pluginElement.insertAdjacentHTML("afterend", content)

    pluginElement.remove();
}


