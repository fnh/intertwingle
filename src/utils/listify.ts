export function listify(str: string, separator = ",") {
    return (str || "")
            .split(separator)
            .map(s => s.trim())
            .filter(x => x);
}