import { getWeekNumber } from "../utils/date.js";

export default async function rewriteDates({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const document = templateDom.window.document;

    const dateFormat = pluginParams["date-format"] || "{yyyy}/{week}"

    const timeElements = [...document.getElementsByTagName("time")];

    for (let timeElement of timeElements) {
        if (timeElement.getAttribute("no-date-rewrite") !== null) {
            console.log("Skip rewriting", timeElement.innerHTML);
            continue;
        }
        const datetime = timeElement.getAttribute("datetime");
        let pubDate = new Date(datetime);
        const { year, week } = getWeekNumber(pubDate);
        let month = pubDate.getMonth() + 1;

        let formated = 
            dateFormat
                .replace("{yyyy}", year)
                .replace("{week}", week)
                .replace("{m}", month)

        timeElement.innerHTML = formated;
    }

    pluginElement.remove();
}