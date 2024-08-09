import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { sveltePreprocess } from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

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

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...md_extensions],
	preprocess: [
		sveltePreprocess({
			// postcss: true
			scss: {
				importer: function(url, prev) {
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
