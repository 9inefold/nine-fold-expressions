import { fetchPosts, filterPosts } from '$util/fetch';
import type { BlogPost } from '$util/types';

export const postTable: BlogPost[] = fetchPosts(true);
export const filteredPostTable: BlogPost[] = filterPosts(postTable);
