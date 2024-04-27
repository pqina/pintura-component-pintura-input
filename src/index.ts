// Types
import { ImageSource, PinturaDefaultImageWriterResult, PinturaImageState } from '@pqina/pintura';

// Helpers imported from core project
import h from './utils/h';
import isString from './utils/isString';
import isBrowser from './utils/isBrowser';
import toCamelCase from './utils/toCamelCase';
import stringReplace from './utils/stringReplace';
import hasDefinedCustomElement from './utils/hasDefinedCustomElement';
import dropable from './actions/dropable';

interface ImageInputElement extends HTMLElement {
    currentState: PinturaDefaultImageWriterResult | undefined;
}

const TAG = 'pintura-input';

const GLOBAL_PROPS_KEY = 'PinturaInput';

const PROCESS_HTML = `<output data-process style="display:flex;align-items:center;pointer-events:none;">
    <img src="{url}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <span>{{success}}</span>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`;

const LOAD_HTML = `<div data-load style="display:flex;align-items:center;pointer-events:none;">
    <img src="{{url}}" alt="" style="object-fit:cover;width:auto;height:1.5em;margin-right:.5em;"/>
    <button data-remove style="pointer-events:all;margin-left:.5em;" aria-label="Reset">{{reset}}</button>
</output>`;

const FILE_INPUT_ATTRIBUTES = ['accept', 'capture'];

interface PinturaHTMLInputElement extends HTMLInputElement {
    _files: File[];
}

const editImage = (
    src: ImageSource,
    options?: {
        store: string | { url: string; dataset: (imageState: any) => any[][] };
        editor: any;
        eventTarget: HTMLElement;
        imageState: PinturaImageState | undefined;
    }
) =>
    new Promise((resolve, reject) => {
        const { store, editor, eventTarget, imageState } = options;

        // import editor API
        const { openDefaultEditor, dispatchEditorEvents } = window.pintura;

        // optionally override reader and writer
        const io: any = {};

        if (editor.imageReader) {
            io.imageReader = {
                ...editor.imageReader,
            };
        }

        if (editor.imageWriter || store) {
            io.imageWriter = {
                store: isString(store) ? store : store,
                ...editor.imageWriter,
            };
        }

        // open editor
        const instance = openDefaultEditor({
            // set reader and writer props
            ...io,
            // can overwrite anything with global props, except src property, will filter out properties below
            ...filterKeys(editor, ['id', 'name', 'store', 'imageWriter', 'imageReader']),
            src,
            // set initial image state
            imageState,
        });

        // route events
        const unsubs = dispatchEditorEvents(instance, eventTarget);

        let rejected = false;
        instance.on('loadabort', () => {
            instance.close();
            rejected = true;
        });
        instance.on('loaderror', reject);
        instance.on('processerror', reject);
        instance.on('close', () => {
            // clean up events
            unsubs.forEach((unsub) => unsub());

            // handle reject or resolve based on interaction
            rejected ? reject() : resolve(undefined);
        });
        instance.on('process', resolve);
    });

const attr = (element: HTMLElement, key: string) => element.getAttribute(key);

const filterKeys = (input: { [key: string]: any }, excluded: string[]) =>
    Object.keys(input)
        .filter((key) => !excluded.includes(key))
        .reduce((obj, key) => {
            return {
                ...obj,
                [key]: input[key],
            };
        }, {});

const fileInputReset = (input: PinturaHTMLInputElement) => {
    input.value = '';
    if (!/safari/i.test(navigator.userAgent)) {
        input.type = '';
        input.type = 'file';
    }
    delete input._files;
};

const fileInputSet = (input: PinturaHTMLInputElement, file: File) => {
    try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    } catch (err) {
        input._files = [file];
    }
};

const fileInputGet = (input: PinturaHTMLInputElement) => {
    // no target available on this event, so maybe this is not a file input event but a custom event, either way, we skip
    if (!input) return;

    // only deal with changes on file input fields that have a specific class
    if (!(<HTMLElement>input).matches(`input[type="file"]`)) return;

    // is a file input
    const fileInput = <PinturaHTMLInputElement>input;

    // get a file (_files is for older browsers)
    const file = fileInput.files[0] || (fileInput._files || [])[0];

    // no file, so might've cancelled the browse action
    if (!file) return;

    // test if file is of type image
    if (!/image/.test(file.type)) return;

    return file;
};

const toProp = (key: string, prefix = '') =>
    toCamelCase(key.replace(new RegExp('^' + prefix, 'g'), ''));

const toValue = (str: string) => {
    // to actual boolean
    if (str === 'true' || str === 'false') return str === 'true';

    // to number
    if (!isNaN(<any>str)) return parseFloat(str);

    // if is division (4/3)
    if (/[0-9]+\/[0-9]+/.test(str)) {
        const [a, b] = str
            .split('/')
            .map((str) => str.trim())
            .map(parseFloat);
        return a / b;
    }

    // to object, if fails, will be treated as string
    if (/^\{|\[/.test(str)) {
        try {
            return JSON.parse(str);
        } catch (err) {
            // intentionally empty
        }
    }

    // probably a string
    return str;
};

const nodeMapToObject = (nodeMap: NamedNodeMap) =>
    Object.values(nodeMap).reduce((props, attr) => {
        const prop = toProp(attr.name);
        props[prop] = toValue(attr.value);
        return props;
    }, {});

const getStoreConfig = (name: string, storeURL: string | undefined, attributes: NamedNodeMap) => {
    // get store fields from dataset
    const storeFields = Object.values(attributes)
        .filter((attr) => /^post/.test(attr.name))
        .map((attr) => [attr.name.replace(/^post-/, ''), attr.value]);

    // set up store configuration object
    // let store: string | { url: string; dataset: Function };

    const store = {
        url: storeURL || '',
        dataset: (imageState) => {
            return [...storeFields, [name, imageState.dest, imageState.dest.name]];
        },
    };

    return store;
};

//
// this is where most of the magic happens
//
const applyPlaceholders = (element: HTMLElement, placeholders: any) => {
    // replace attribute values
    Array.from(element.attributes)
        .filter(({ value }) => value.length && value.includes('{'))
        .forEach(({ name, value }) =>
            element.setAttribute(name, stringReplace(value, placeholders, '{', '}'))
        );

    // loop over child nodes and replace text values
    const nodes = element.childNodes;
    nodes.forEach((node) => {
        if (node.nodeType === 1) node = applyPlaceholders(<HTMLElement>node, placeholders);
        if (node.nodeType === 3)
            node.textContent = stringReplace(node.textContent, placeholders, '{', '}');
    });

    // done!
    return element;
};

const getTemplatePartial = (template, name) =>
    template && template.content.querySelector(`[data-${name}]`);

const getTemplate = (root: HTMLElement) => root.querySelector('template');

const getTemplates = (root: HTMLElement) => {
    const template = getTemplate(root);
    const empty = getTemplatePartial(template, 'empty');
    const load = getTemplatePartial(template, 'load');
    const process = getTemplatePartial(template, 'process');
    return {
        empty,
        load,
        process,
    };
};

const hasTemplate = (root: HTMLElement, name: string) => {
    const templates = getTemplates(root);
    return !!templates[name];
};

const getView = (root: HTMLElement, name: string) => root.querySelector(`[data-${name}]`);

const setView = (root: HTMLElement, name: string, placeholders?: any) => {
    const templates = getTemplates(root);

    // remove current views
    Object.keys(templates)
        .map((name) => getView(root, name))
        .filter(Boolean)
        .forEach((view) => view.remove());

    // set new template view if it exists
    if (!templates[name]) return false;

    // create new view
    let element = templates[name].cloneNode(true);

    // replace placeholders
    if (placeholders) element = applyPlaceholders(element, placeholders);

    // add view
    root.appendChild(element);

    // make dropable element
    if (root.querySelector('[data-drop]')) dropable(element, { bubbles: true });

    return true;
};

const getFileInput = (root: HTMLElement) =>
    <PinturaHTMLInputElement>root.querySelector('input[type="file"]');

const getResponseInput = (root: HTMLElement) =>
    <HTMLInputElement>root.querySelector('input[type="hidden"]');

const getSrc = (root: HTMLElement) => {
    const src = attr(root, 'src');
    if (src != null) return src;
};

const getCurrentState = (root: ImageInputElement): PinturaDefaultImageWriterResult => {
    return root.currentState;
};

const setCurrentState = (
    root: ImageInputElement,
    imageState: PinturaDefaultImageWriterResult | undefined
) => {
    root.currentState = imageState;
};

const getStore = (root: HTMLElement) => attr(root, 'store');

const appendDefaultTemplate = (root: HTMLElement, html: string, templateProps: any) => {
    const template = getTemplate(root) || document.createElement('template');
    template.innerHTML = template.innerHTML + stringReplace(html, templateProps, '{{', '}}');
    if (!template.parentNode) root.appendChild(template);
};

// runs when the image was stored on a server or somewhere else
const didStoreImage = (root: HTMLElement, dest: File, store) => {
    // always hide the file input
    const input = getFileInput(root);
    input.hidden = true;

    // set the response text to the hidden input
    const responseInput = getResponseInput(root);
    responseInput.value = store.responseText;

    // switch to process view
    setView(root, 'process', {
        response: store.responseText,
        filename: dest.name,
        url: URL.createObjectURL(dest),
    });
};

// runs when the output image was set to the file input element
const didSetImage = (root: HTMLElement, dest: File) => {
    // if a process view has been defined, it'll be used to show the ouptut
    const didSetView = setView(root, 'process', {
        filename: dest.name,
        url: URL.createObjectURL(dest),
    });

    // hide file input if a process view was defined
    if (didSetView) getFileInput(root).hidden = true;
};

const didSetCurrentState = (root: HTMLElement, currentState) => {
    // did create image
    const { dest, store } = currentState;
    const input = getFileInput(root);

    // the image has been stored on the server
    if (store) {
        didStoreImage(root, dest, store);
    }
    // wasn't sent to store, update file input value on modern browser (sorry Safari)
    // https://pqina.nl/blog/the-trouble-with-editing-and-uploading-files-in-the-browser/
    else {
        fileInputSet(input, dest);
        didSetImage(root, dest);
    }
};

const edit = (
    root: ImageInputElement,
    src: ImageSource | undefined,
    imageState?: PinturaImageState
) => {
    // doesn't work without source
    if (!src) return;

    // doesn't work without input element
    const input = getFileInput(root);
    if (!input) return;

    // merge global, global element id, and locale element attribute props
    const props = {
        ...window[GLOBAL_PROPS_KEY],
        ...window[root.id],
        ...nodeMapToObject(root.attributes),
    };

    // we're done processing the image
    const didProcessImage = (res?: PinturaDefaultImageWriterResult) => {
        // closed popup, clear file input
        if (!res) {
            setCurrentState(this, undefined);
            fileInputReset(input);
            return;
        }

        // store current state
        setCurrentState(root, res);

        didSetCurrentState(root, res);
    };

    // something went wrong clear input element
    const didThrowError = () => {
        // reset file input element
        fileInputReset(input);
    };

    // open the editor
    editImage(src, {
        editor: props,
        eventTarget: root,
        imageState,
        store:
            props.store &&
            getStoreConfig(getResponseInput(root).name, props.store, root.attributes),
    })
        .then(didProcessImage)
        .catch(didThrowError);
};

// private init
function init() {
    // get store reference
    const store = getStore(this);

    // get initial source reference
    const src = getSrc(this);

    // template default props
    const templateProps = {
        success: attr(this, 'input-store-success') || '"{filename}" uploaded successfully',
        reset: attr(this, 'input-button-reset') || '&times;',
        url: src,
    };

    // if src and no template, set minimal process template
    if (src && !hasTemplate(this, 'load')) appendDefaultTemplate(this, LOAD_HTML, templateProps);

    // if store and no template, set minimal process template
    if (store && !hasTemplate(this, 'process'))
        appendDefaultTemplate(this, PROCESS_HTML, templateProps);

    let inputFile: PinturaHTMLInputElement = getFileInput(this);
    let inputResponse = getResponseInput(this);
    const inputName = (inputFile && inputFile.name) || attr(this, 'name') || 'image';

    if (!inputFile) {
        // copy over relevant attributes from parent to new file input element
        inputFile = <PinturaHTMLInputElement>h('input', { type: 'file' });
        FILE_INPUT_ATTRIBUTES.forEach((key) => {
            const value = attr(this, key);
            if (value === null) return;
            inputFile.setAttribute(key, value);
        });
        this.removeAttribute('name');
        this.append(inputFile);
    }

    // if not store defined the image input name is set
    if (!store) {
        inputFile.name = inputName;
    } else {
        // remove name if store defined and
        inputFile.removeAttribute('name');

        // add hidden value with same name if not already defined
        if (!inputResponse) {
            inputResponse = <HTMLInputElement>h('input', { type: 'hidden', name: inputName });
            this.append(inputResponse);
        }
    }

    // if has template element and has no initial source -> hide file input
    if (!src && hasTemplate(this, 'empty')) {
        setView(this, 'empty');
        inputFile.hidden = true;
    }

    // if has a src and a load state template we init with load state template
    if (src && hasTemplate(this, 'load')) {
        setView(this, 'load');
        inputFile.hidden = true;
    }

    // add accept attr if missing
    if (!inputFile.accept || !/image/.test(inputFile.accept)) inputFile.accept = 'image/*';

    // don't allow multiple at this time
    inputFile.removeAttribute('multiple');

    // route events
    this.handleEvent = (e) => {
        const { type, target } = e;
        if (type === 'change' && target === inputFile) return this.edit();
        if (type === 'click') return routeClick(e);
        if (type === 'dropfiles') return dropFiles(e);
    };

    const routeClick = (e: MouseEvent) => {
        const { target } = e;

        const action = ['reset', 'remove', 'browse', 'edit'].find(
            (action) => (<HTMLElement>target).dataset[action] === ''
        );

        if (!action) return;

        this[action]();
    };

    const dropFiles = (e: CustomEvent) => {
        e.stopPropagation();
        const { detail } = e;
        const file = detail.resources[0];
        if (!file) return;

        // set as file in file input, updates file input value on modern browsers
        fileInputSet(inputFile, file);

        // edit dropped file
        this.edit();
    };

    // listen for input
    inputFile.addEventListener('change', this);

    // listen for button clicks and route events set with data attributes
    this.addEventListener('click', this);

    // handle file drops
    this.addEventListener('dropfiles', this);

    // if has current state, restore its view
    if (!this.currentState) return;

    didSetCurrentState(this, this.currentState);
}

function destroy() {
    this.removeEventListener('click', this);
    this.removeEventListener('dropfiles', this);
}

const ImageInputElement =
    isBrowser() &&
    class extends HTMLElement implements ImageInputElement {
        currentState: PinturaDefaultImageWriterResult = undefined;

        connectedCallback() {
            // children loaded, let's go
            if (this.innerHTML) return init.apply(this);

            let timerFallback: number;

            const observer = new MutationObserver(() => {
                if (timerFallback === null) return;
                clearTimeout(timerFallback);
                init.apply(this);
                observer.disconnect();
            });
            observer.observe(this, {
                childList: true,
            });

            // there's probably a better way but this makes sure the inner children have finished loading before testing if a template was defined
            timerFallback = setTimeout(() => {
                timerFallback = null;
                init.apply(this);
            }, 0);
        }

        disconnectedCallback() {
            destroy.apply(this);
        }

        browse() {
            (<HTMLInputElement>this.querySelector('input[type="file"]')).click();
        }

        reset() {
            // clear currentState
            setCurrentState(this, undefined);

            // can't reset if no src
            const src = getSrc(this);
            if (!src) {
                // same as remove
                return this.remove();
            }

            // reset file input
            fileInputReset(getFileInput(this));

            // switch to load view
            setView(this, 'load');
        }

        remove() {
            const inputFile = getFileInput(this);

            // clear current
            fileInputReset(inputFile);

            // clear currentState
            setCurrentState(this, undefined);

            // clear response input
            if (getStore(this)) getResponseInput(this).value = '';

            // switch to empty view, if failed, show file input
            if (!setView(this, 'empty')) inputFile.hidden = false;
        }

        edit() {
            const input = getFileInput(this);

            // needs file input element
            if (!input) return;

            // if no src, can't edit
            const src = getCurrentState(this)?.src || fileInputGet(input) || getSrc(this);

            // edit file input file or initial source
            edit(this, src, getCurrentState(this)?.imageState);
        }
    };

ImageInputElement && !hasDefinedCustomElement(TAG) && customElements.define(TAG, ImageInputElement);
