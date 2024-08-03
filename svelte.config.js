import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { sveltePreprocess } from 'svelte-preprocess';

import { mdsvex } from 'mdsvex';

const md_extensions = [".md", ".svelte.md", ".svx"];
const base_path = (process.env.NODE_ENV === 'production') ? '/eight-fold-expressions' : '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...md_extensions],
	preprocess: [
		sveltePreprocess({
			// postcss: true
		}),
		mdsvex({
			extensions: [...md_extensions],
			layout: {}
		})
	],
	kit: {
		adapter: adapter(),
		alias: {
			'$routes': 			'src/routes',
			"$lib":					'src/lib',
			'$components': 	'src/lib/components',
			'$styles': 			'src/lib/styles',
			'$util':				'src/lib/util',
		},
		prerender: {
			entries: ["*", "/blog"],
			crawl: true,
		},
    paths: { base: base_path, }
	}
};

export default config;
