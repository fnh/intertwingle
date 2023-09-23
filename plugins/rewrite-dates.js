import { getWeekNumber } from "../utils/date.js";

export default async function rewriteDates({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {
    const document = templateDom.window.document;

    const timeElements = [...document.getElementsByTagName("time")];

    for (let timeElement of timeElements) {
        const datetime = timeElement.getAttribute("datetime");
        const { year, week } = getWeekNumber(new Date(datetime));
        timeElement.innerHTML = `${year}/${week}`;
    }

    pluginElement.remove();
}