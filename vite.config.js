import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import banner from 'vite-plugin-banner';

import { readFile } from 'fs/promises';
const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));

export default {
    build: {
        type: ['iife', 'es'],
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'pinturainput',
            fileName: 'pinturainput',
            formats: ['es', 'iife'],
        },
        rollupOptions: {
            output: {
                globals: 'pinturainput',
            },
        },
    },
    plugins: [
        svelte({
            /* plugin options */
            preprocess: sveltePreprocess({}),
        }),
        banner(`/*!
* Pintura Input v${pkg.version} 
* (c) 2018-${new Date().getFullYear()} PQINA Inc. - All Rights Reserved
* License: https://pqina.nl/pintura/license/
*/
/* eslint-disable */`),
    ],
};
