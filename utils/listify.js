export function listify(str, separator = ",") {
    return (str || "")
            .split(separator)
            .map(s => s.trim())
            .filter(x => x);
}