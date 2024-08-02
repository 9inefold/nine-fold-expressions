import { filteredPostTable } from '$util';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ params }) {
	const post = filteredPostTable
    .find((post) => (params.slug === post.slug));
	return { post: post };
}
