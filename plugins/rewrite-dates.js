function getWeekNumber(d) {
    let copy = 
        new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    copy.setUTCDate(copy.getUTCDate() + 4 - (copy.getUTCDay() || 7));

    const firstDayOfYear = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const week = Math.ceil((((copy - firstDayOfYear) / 86400000) + 1) / 7);

    return {year: copy.getUTCFullYear(), week};
}

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
        const {year, week} = getWeekNumber(new Date(datetime));
        timeElement.innerHTML = `${year}/${week}`;
    }

}