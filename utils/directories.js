export function directories(path) {
    // assumption: path ends with a filename
    let all = path.split("/");
    let dirs = all.slice(0, all.length - 1)

    return dirs.join("/")
}

export function directoryWhenIndex(path) {
    if (path.endsWith("index.html")) {
        return directories(path) + "/";
    }
    return path;
}

export function normUrl(url) {
    // TODO consider using URL() and methods/properties from there

    const cleanUrl = directoryWhenIndex(url);
    const isCleanEnough =
        cleanUrl.endsWith(".html") || cleanUrl.endsWith("/");

    return isCleanEnough ? cleanUrl : cleanUrl + "/";
}
