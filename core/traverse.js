import { readdir } from "node:fs/promises";
import path from "path";

function isExcluded(name, forbidden = []) {
    return name[0] === "." || forbidden.includes(name);
}

function isIncluded(name) {
    return !isExcluded(name);
}

export async function traverse(
    directoryPath,
    processFn = () => { }
) {

    let results = [];
    const files =
        await readdir(directoryPath, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directoryPath, file.name);

        if (file.isDirectory()) {
            if (isIncluded(file.name)) {
                let resultOfDir = await traverse(filePath, processFn);
                for (let res of resultOfDir) {
                    results.push(res);
                }
            }
        } else {
            if (isIncluded(file.name)) {
                let fn = await processFn(filePath);
                results.push(fn)
            }
        }
    }

    return results;
}