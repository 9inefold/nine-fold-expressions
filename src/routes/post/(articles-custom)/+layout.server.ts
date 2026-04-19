import { filteredPostTable } from '$util';
import { debug } from '$lib/config';

function getPostLikeSlug(pathname: string): string {
  const sliceBack = pathname.endsWith('/');
  if (sliceBack && pathname.length <= 1) {
    throw new Error('Invalid pathname!');
  }
  return pathname.split(/[\\\/]/).slice(sliceBack ? -2 : -1)[0];
}

export async function load({ url }: { url: { pathname: string } }) {
  const { pathname } = url;
  //const slug = pathname.replace(/[\w-]*\//g, '');
  const slug = getPostLikeSlug(pathname);
	let post = filteredPostTable
    .find((post) => (slug === post.slug));
  if (!post)
    console.warn(`No post with '${slug}': '${pathname}'!`);
	return { post: post };
}
