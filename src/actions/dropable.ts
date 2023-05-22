import isBinary from '../utils/isBinary';
import isImage from '../utils/isImage';

const getResourceFromItem = async (item: DataTransferItem) =>
    new Promise((resolve) => {
        if (item.kind === 'file') return resolve(item.getAsFile());
        item.getAsString(resolve);
    });

const getResourcesFromEvent = (e: DragEvent): Promise<any> =>
    new Promise((resolve, reject) => {
        const { items } = e.dataTransfer;
        if (!items) return resolve([]);
        Promise.all(Array.from(items).map(getResourceFromItem))
            .then((res) => {
                resolve(
                    res.filter(
                        (item) =>
                            (isBinary(item) && isImage(<File>item)) || /^http/.test(<string>item)
                    )
                );
            })
            .catch(reject);
    });

export default (node: HTMLElement, options: any = {}) => {
    const handleDragOver = (e: DragEvent) => {
        // need to be prevent default to allow drop
        e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation(); // prevents parents from catching this drop

        try {
            const resources = await getResourcesFromEvent(e);

            node.dispatchEvent(
                new CustomEvent('dropfiles', {
                    detail: {
                        event: e,
                        resources,
                    },
                    ...options,
                })
            );
        } catch (err) {
            // silent, wasn't able to catch
        }
    };

    node.addEventListener('drop', handleDrop);
    node.addEventListener('dragover', handleDragOver);

    // remove method
    return {
        destroy() {
            node.removeEventListener('drop', handleDrop);
            node.removeEventListener('dragover', handleDragOver);
        },
    };
};
