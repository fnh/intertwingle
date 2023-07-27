export function directories(path) {
    // assumption: path ends with a filename
    let all = path.split("/");
    let dirs = all.slice(0, all.length - 1)

    return dirs.join("/")
}

