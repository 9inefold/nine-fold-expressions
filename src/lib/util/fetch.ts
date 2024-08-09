import type { BlogPost } from "$util/types";
import { makeUrl } from "$util/url";
// import striptags from 'striptags';

const tagAliases: Map<string, string> = new Map<string, string>([
	["$hc", "headless-compiler"]
]);

export const fetchPosts = (doRender: boolean = false): BlogPost[] => {
	const flat = import.meta.glob('$routes/*/*.md', {eager: true});
	const nested = import.meta.glob('$routes/*/*/*.md', {eager: true});
	const imports = { ...flat, ...nested };
	const posts: BlogPost[] = [];

	for (const path in imports) {
		const post = imports[path] as any;
		if (post) {
			const render = doRender && post.default.render;
			if (!post.metadata.slug)
				post.metadata.slug = getSlug(path);
			const comp = post.metadata.component;
      posts.push({
				...post.metadata,
				component: comp ? comp as string : false,
				html: render ? post.default.render()?.html : undefined
			});
    }
	}

	return posts;
};

export const filterPosts = (posts: BlogPost[]): BlogPost[] => {
	const filteredPosts = posts
		.filter((post) => !post.hidden);
	return filteredPosts
		.sort((a, b) => dateSort(a, b))
		.map((post) => {
			if (post && post.tags)
				post.tags = mapTags(post.tags);
			return {
				...post,
				related: relatedPosts(filteredPosts, post),
			} as BlogPost;
		});
};

function getSlug(path: string): string {
	const pathSlices = path.split(/[\\\/]/).slice(-2);
	if (pathSlices[1] == '+page.md') {
		const folder = pathSlices[0];
		if (folder.match(/\([\w\-]\)/))
			// Should never get here...
			return folder.slice(1, -1);
		return folder;
	}
	return pathSlices[1].slice(0, -3);
}


function mapTags(tags: string[]): string[] {
	return tags.map((tag) => {
		if (tagAliases.has(tag))
			return tagAliases.get(tag) as string;
		return tag;
	})
}

function dateSort(lhs: BlogPost, rhs: BlogPost) {
	const lhsTime = new Date(lhs.date).getTime();
	const rhsTime = new Date(rhs.date).getTime();
	return lexComp(lhsTime, rhsTime);
}

const relatedPosts = (posts: BlogPost[], post: BlogPost) => {
	const related = posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aTags = a.tags?.filter((t) => post.tags?.includes(t));
      const bTags = b.tags?.filter((t) => post.tags?.includes(t));
      return lexComp(aTags?.length, bTags.length);
    });
	return related.slice(0, 3);
}

function lexComp<Type>(a: Type, b: Type) {
	return (a > b) ? -1 : (a < b) ? 1 : 0;
}
