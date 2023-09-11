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