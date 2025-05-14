import { dev } from '$app/environment';
export { base } from '$app/paths';
//export { blogUrl } from '$util';
import { base } from '$app/paths';
export const blogUrl: string = base

export const title = '(nine && ...)';
export const description = 'Ninefold\'s blog';
export const url = dev ? 'http://localhost:5173' : 'https://9inefold.github.io/nine-fold-expressions'
export const homepage = `${url}/main`;

// So I don't accidentally leave this on in release.
const debugInternal = true;
export const debug = dev && debugInternal;

export const keywords = [
	'Ninefold',
	'9inefold',
	'nine-fold-expressions',
	'Svelte',
	'SvelteKit',
	'Blog',
	'Static Site',
	'Web Development',
	'Low Level Programming',
	'C++', 'CPP', 'Assembly',
];
