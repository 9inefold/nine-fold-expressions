import adapter from '@sveltejs/adapter-static';
// import { vitePreprocess } from '@sveltejs/kit/vite';
import { sveltePreprocess } from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

// import remarkCodeExtra from 'remark-code-extra';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';

import rehypeModCode from '@plugin/rehype-mod-code';

const md_extensions = [".md", ".svelte.md", ".svx"];
const base_path = (process.env.NODE_ENV === 'production') ? '/eight-fold-expressions' : '';
const layouts = './src/layouts';

const stub = (name) => {
	return `${layouts}/${name}-s.svelte`;
}

const aliases = {
	'$routes': 			'src/routes',
	'$layouts':			'src/layout',
	"$lib":					'src/lib',
	'$components': 	'src/lib/components',
	'$styles': 			'src/lib/styles',
	'$util':				'src/lib/util',
};

const langs = {
	x86asm:	'nasm',
	x86: 		'nasm',
	rs:			'rust',
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...md_extensions],
	preprocess: [
		sveltePreprocess({
			// postcss: true
			scss: {
				importer: function(url, _) {
					if (!url.startsWith('$'))
						return null;
					const parts = url.split('/');
					if (!parts?.length)
						return null;
					const route = aliases[parts.at(0)];
					if (!route)
						return null;
					return {
						file: ['.', route, ...parts.slice(1)].join('/')
					};
				}
			}
		}),
		mdsvex({
			extensions: [...md_extensions],
			highlight: {
				alias: langs,
			},
			rehypePlugins: [
				rehypeExternalLinks,
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'wrap',
						properties: { className: ['heading-link'], title: 'Permalink' },
					}
				],
				rehypeModCode,
			]
		})
	],
	kit: {
		adapter: adapter(),
		alias: aliases,
		prerender: {
			// entries: ["*", "/blog"],
			// crawl: true,
			handleHttpError: 'warn',
		},
    paths: { base: base_path, }
	}
};

export default config;
