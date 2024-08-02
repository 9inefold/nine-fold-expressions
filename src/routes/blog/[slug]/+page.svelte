<script lang="ts">
  import type { BlogPost } from '$util/types';

  export let data: { post: BlogPost };
	$: ({ post } = data);
</script>

<article>
  <h1>{post.title}</h1>
  <p>Published on: {post.date}</p>
  <p>Tags: {post.tags?.join(', ')}</p>
  {@html post.html}
</article>
