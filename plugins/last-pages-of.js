import { listify } from "../utils/listify.js";
import { group } from "../utils/group.js";

export default async function lastPagesOf({
    templateDom,
    page,
    metamodel,
    pluginParams,
    pluginElement,
}) {

    let categories = listify(pluginParams["category"]);

    let numberOfItems = Number(pluginParams["number-of-items"]);

    let groupedBy = pluginParams["grouped-by"];

    const reverseChronologically =
        (a, b) => b.publicationDate?.localeCompare(a.publicationDate)

    let lastPages =
        metamodel.pages
            .filter(page => page.isPublished && page.publicationDate)
            .filter(page => categories.length ? categories.includes(page.category) : true)
            .sort(reverseChronologically)
            .slice(0, numberOfItems);

    let bySameMonth = (a, b) => {
        let ad = new Date(a.publicationDate);
        let bd = new Date(b.publicationDate);

        return (ad.getMonth() == bd.getMonth())
            && (ad.getFullYear() == bd.getFullYear());

    }

    let groupedByMonth = group(lastPages, bySameMonth);


    let templateRef = pluginElement.querySelector("template");

    if (templateRef) {
        console.log(groupedByMonth.length + " different month")

        for (let gr of groupedByMonth) {

            for (let [index,page] of gr.entries()) {
                if (index == 0) {
                    let pubDate = new Date(page.publicationDate);
                    
                    let content = `<b><time datetime="${pubDate}"></time></b>`;

                    const templateInstance =
                        templateRef.content.cloneNode(true);

                    if (!templateInstance) {
                        continue;
                    }

                    let outletRef = templateInstance.querySelector("intertwingle[data-outlet]");

                    if (!outletRef) {
                        console.log("no outlet in template")
                        continue;
                    }

                    outletRef.insertAdjacentHTML("afterend", content);
                    pluginElement.parentElement.append(templateInstance)

                }


                const path = new URL(page.fullQualifiedURL).pathname;
                let content = `<a href="${path}">${page.title}</a>`

                const templateInstance =
                    templateRef.content.cloneNode(true);

                if (!templateInstance) {
                    console.log("no template instance");
                    continue;
                }

                let outletRef = templateInstance.querySelector("intertwingle[data-outlet]");

                if (!outletRef) {
                    console.log("no outlet in template")
                    continue;
                }

                outletRef.insertAdjacentHTML("afterend", content);
                pluginElement.parentElement.append(templateInstance)
            }
        }

    } else {
        console.log("No template found for last pages of ", { categories, numberOfItems })
    }
    pluginElement.remove();
}