<script lang="ts">
  import type { BlogPost } from '$util/types';
  import dateformat from 'dateformat';

  export let data: { post: BlogPost };
	$: ({ post } = data);

  const formatDate = (date: string) => {
    return dateformat(date, "UTC:mmmm dd, yyyy");
  };
</script>

<article>
  <h1>{post.title}</h1>
  <p>Published on: {formatDate(post.date)}</p>
  {#if post.updated}
    <p>Updated on: {formatDate(post.updated)}</p>
  {/if}
  <p>Tags: {post.tags?.join(', ')}</p>
  {@html post.html}
</article>
