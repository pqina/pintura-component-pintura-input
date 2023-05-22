let result: boolean = null;
export default (): boolean => {
    if (result === null)
        result = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    return result;
};
