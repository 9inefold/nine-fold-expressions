import type { BlogPost } from "$util/types";
// import striptags from 'striptags';

export const fetchPosts = (doRender: boolean = false): BlogPost[] => {
	const imports = import.meta.glob('$routes/blog/*.md', {eager: true});
	const posts: BlogPost[] = [];

	for (const path in imports) {
		const post = imports[path] as any;
		if (post) {
			const render = doRender && post.default.render;
      posts.push({
				...post.metadata,
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
			return {
				...post,
				related: relatedPosts(filteredPosts, post),
			} as BlogPost;
		});
};

const dateSort = (lhs: BlogPost, rhs: BlogPost) => {
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
