import isObject from './isObject';

export default (
    str: string,
    entries: { [property: string]: string } = {},
    prefix = '',
    postfix = ''
): string => {
    return Object.keys(entries)
        .filter((key) => !isObject(entries[key]))
        .reduce((prev, curr) => {
            return prev.replace(new RegExp(prefix + curr + postfix), entries[curr]);
        }, str);
};
