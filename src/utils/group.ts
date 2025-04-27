export function group<T>(
    toBeGrouped: Array<T>,
    isInEquivalenceClass: (a: T, b: T) => boolean,
    grouped: Array<Array<T>> = []
) {
    if (!toBeGrouped.length) {
        return grouped;
    } else {
        let nextGroup =
            toBeGrouped.filter(element => isInEquivalenceClass(element, toBeGrouped[0]));

        let nextRest =
            toBeGrouped.filter(element => !isInEquivalenceClass(element, toBeGrouped[0]));

        return group(nextRest, isInEquivalenceClass, [...grouped, nextGroup]);
    }
}
