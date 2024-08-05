<script lang="ts">
  import type { BlogPost } from '$util/types';
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import Post from '$components/Post.svelte'

  export let data: { post: BlogPost };
	$: ({ post } = data);
</script>

{#if post}
<Header />
<Post post={post}>
  <slot />
</Post>
<Footer />
{/if}
