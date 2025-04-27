import { readdir } from "node:fs/promises";
import path from "path";

function isExcluded(name: string, forbidden: Array<string> = ["node_modules"]) {
    return name.startsWith(".") || forbidden.includes(name);
}

function isIncluded(name: string) {
    return !isExcluded(name);
}

export async function traverse<ProcessingResult>(
    directoryPath: string,
    processFn: (filePath: string) => Promise<ProcessingResult>
) {
    let results: Array<ProcessingResult> = [];

    const files =
        await readdir(directoryPath, { withFileTypes: true });

    const includedFiled = files.filter(file => isIncluded(file.name));

    for (const file of includedFiled) {
        const filePath = path.join(directoryPath, file.name);

        if (file.isDirectory()) {
            let processedFiles = await traverse(filePath, processFn);
            results = results.concat(processedFiles);
        } else {
            let processedFile = await processFn(filePath);
            results.push(processedFile)
        }
    }
    return results;
}