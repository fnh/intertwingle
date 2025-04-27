export function last<T>(array: Array<T>): T | undefined {
    return Array.isArray(array) ? array[array.length - 1] : undefined;
}