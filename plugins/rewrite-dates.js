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
        const { year: yearISO8601, week } = getWeekNumber(pubDate);
        let year = pubDate.getFullYear();
        let month = pubDate.getMonth() + 1;
        let day = pubDate.getDate();
        let dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][pubDate.getDay()];

        let formated = 
            dateFormat
                .replace("{y}", year)
                .replace("{yyyy}", yearISO8601)
                .replace("{week}", week)
                .replace("{m}", month)
                .replace("{d}", day)
                .replace("{dayName}", dayName);

        timeElement.innerHTML = formated;
    }

    pluginElement.remove();
}