import { fetchPosts, filterPosts } from '$util/fetch';
import type { BlogPost } from '$util/types';
import { json } from '@sveltejs/kit';

export async function GET() {
	const allPosts = fetchPosts(true);
  const filtered = filterPosts(allPosts);
	return json(filtered);
};
