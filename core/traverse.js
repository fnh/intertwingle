import { readdir } from "node:fs/promises";
import path from "path";

function isExcluded(name, forbidden = ["node_modules"]) {
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
    const includedFiled = files.filter(file => isIncluded(file.name));

    for (const file of includedFiled) {
        const filePath = path.join(directoryPath, file.name);

        if (file.isDirectory()) {
            let resultOfDir = await traverse(filePath, processFn);
            for (let res of resultOfDir) {
                results.push(res);
            }
        } else {
            let fn = await processFn(filePath);
            results.push(fn)
        }

    }
    return results;
}