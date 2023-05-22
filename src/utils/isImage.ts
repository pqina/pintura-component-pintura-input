export default (file: Blob | File): boolean => /^image/.test(file.type);
