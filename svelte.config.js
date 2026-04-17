import adapter from '@sveltejs/adapter-static';
// import { vitePreprocess } from '@sveltejs/kit/vite';
import { sveltePreprocess, replace } from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeModCode from '@plugin/rehype-mod-code';

const md_extensions = [".md", ".svelte.md", ".svx"];
const IN_PROD = process.env.NODE_ENV === 'production';
const BASE_PATH = IN_PROD ? '/nine-fold-expressions' : '';

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

/**
 * @type {import('sass').LegacySyncImporter}
 * Converts `$alias/route` into `real/path/to/folder/route`.
 */
function mapImporterAliases(url, prev) {
  if (!url.startsWith('$'))
		return null;
	const parts = url.split('/');
	if (!parts?.length)
		return null;
	const route = aliases[parts[0]];
	if (!route)
		return null;
	return {
		file: ['.', route, ...parts.slice(1)].join('/')
	};
}

/** @param {string} str */
function minifyString(match, str) {
  const out = str.trim()
    .replaceAll(/\s+/g, ' ')
    .replaceAll(' )', ')')
    .replaceAll(/([:;,\(]) /g, '$1');
  return `\`${out}\``;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...md_extensions],
	preprocess: [
		sveltePreprocess({
      replace: [
        [/\(\(`(.+?)`\)\)/gms, minifyString],
      ],
			// postcss: true
			scss: {
				importer: mapImporterAliases,
        //outputStyle: IN_PROD ? 'compressed' : 'expanded',
        outputStyle: 'compressed',
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
				[
					rehypeModCode,
					{
						commands: {'test': testCommand},
						callbacks: [
              testCallback,
            ],
						warn: true
					}
				],
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
    paths: { base: BASE_PATH }
	}
};

export default config;

////////////////////////////////////////////////////////////////////////
// TODO: Move

const noTest = true;
let runDefault = false;
let runCallback = false;

/** @type {import('@plugin/rehype-mod-code').CommandCallback} */
function testCommand(args) {
	if (noTest) return;
	if (args.at(0) !== 'log') return;
	const cmd = args.at(1);
	if (!cmd) {
		runCallback = true;
	} else if (cmd === 'on') {
		runDefault = true;
		runCallback = true;
	} else if (cmd === 'off') {
		runDefault = false;
		runCallback = false;
	}
}

/** @type {import('@plugin/rehype-mod-code').UserCallback} */
function testCallback(nodes, lang) {
	if (noTest) return;
	if (runCallback) {
		console.log(lang);
	}
	runCallback = runDefault;
}
