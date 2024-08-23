# Pintura Input

The `<pintura-input>` custom element is a tiny wrapper around the `<input type="file">` element, making it super easy to add image editing to file input elements.

For a quick start use the [Pintura Input example project](https://github.com/pqina/pintura-example-pintura-input) as a guideline.

## Installation

Install via npm:

```bash
npm install @pqina/pintura @pqina/pintura-input
```

Or you can [download the repository as a zip](https://github.com/pqina/pintura-component-pintura-input/archive/refs/heads/main.zip) and use the files in the `dist` folder.

## Usage

```html
<pintura-input image-crop-aspect-ratio="4/3">
    <input type="file" id="my-id" required />
</pintura-input>

<!-- load the pintura -->
<script src="pintura/pintura-iife.js"></script>

<!-- load the <pintura-input> custom element -->
<script src="pintura-input/pinturainput-iife.js"></script>
```

More information in the [Pintura input docs](https://pqina.nl/pintura/docs/v8/installation/pintura-input/).
