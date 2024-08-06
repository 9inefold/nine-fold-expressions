<script lang="ts">
  import type { BlogPost } from '$util/types';
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import Post from '$components/Post.svelte'

  export let data: { post: BlogPost, slug?: string };
	$: ({ post, slug } = data);
</script>

{#if post}
<Header />
<Post post={post}>
  <slot />
</Post>
<Footer />
{:else if slug}
<h1>Fatal error with "{slug}"</h1>
{:else}
<h1>Fatal error.</h1>
{/if}
