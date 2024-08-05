<script lang="ts">
  import type { BlogPost } from '$util/types';
  import dateformat from 'dateformat';
  import Jittery from '$components/basic/Jittery.svelte';
  import Post from '$components/Post.svelte'

  export let data: { post: BlogPost };
	$: ({ post } = data);

  const formatDate = (date: string) => {
    return dateformat(date, "UTC:mmmm dd, yyyy");
  };
</script>

{#if post}
<Post post={post}>
  {@html post.html}
</Post>
{/if}
