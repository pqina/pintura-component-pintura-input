export default (name: string, attributes?: any, children: HTMLElement[] = []): HTMLElement => {
    const el = document.createElement(name);
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(el.__proto__);
    for (const key in attributes) {
        if (key === 'style') {
            el.style.cssText = attributes[key];
        } else if (
            (descriptors[key] && descriptors[key].set) ||
            /textContent|innerHTML/.test(key) ||
            typeof attributes[key] === 'function'
        ) {
            el[key] = attributes[key];
        } else {
            el.setAttribute(key, attributes[key]);
        }
    }
    children.forEach((child) => el.appendChild(child));
    return el;
};
