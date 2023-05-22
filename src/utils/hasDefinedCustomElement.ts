export default (name: string) => document.createElement(name).constructor !== HTMLElement;
