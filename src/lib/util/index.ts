import { fetchPosts, filterPosts } from '$util/fetch';
import type { BlogPost } from '$util/types';
import { base } from '$app/paths';

export const blogUrl: string = `${base}`
export const postTable: BlogPost[] = fetchPosts(true);
export const filteredPostTable: BlogPost[] = filterPosts(postTable);
