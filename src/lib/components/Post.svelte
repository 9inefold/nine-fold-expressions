<script lang="ts">
  import type { BlogPost } from '$util/types';
  import { title, url, blogUrl, keywords, debug } from '$lib/config'
  import dateformat from 'dateformat';
  import Jittery from '$components/basic/Jittery.svelte';

  // import pdark from 'svelte-highlight/styles/paraiso-dark';
  // import pojoaque from '$styles/pojoaque';
  import '$styles/code.scss'

  export let post: BlogPost;
  export let hoverJitter: boolean = true;
  // export let codeStyle: string = pdark;
  $: coverImage = getCoverImage();

  function formatDate(date: string) {
    return dateformat(date, "UTC:mmmm dd, yyyy");
  }

  function getKeywords(): string[] {
    let kw = keywords;
    if (post?.tags?.length) {
      kw = post.tags.concat(kw);
    }
    if (post?.keywords?.length) {
      kw = post.keywords.concat(kw);
    }
    return kw;
  }

  function getCoverImage(): string | undefined {
    if (post?.cover) {
      return post.cover;
    } else if (post?.image) {
      return post.image;
    }
    return undefined;
  }
</script>

<svelte:head>
  <meta name="creator" content="ninefold" />
  <meta name="keywords" content={getKeywords().join(', ')} />

  {#if post.excerpt}
    <meta name="description"         content={post.excerpt} />
    <meta property="og:description"  content={post.excerpt} />
    <meta name="twitter:description" content={post.excerpt} />
  {/if}

  {#if coverImage}
    <meta property="og:image"  content="{url}{coverImage}" />
    <meta name="twitter:image" content="{url}{coverImage}" />
  {/if}

  <link rel="canonical" href="{url}/{post.slug}" />

  <title>{post.title} - {title}</title>
  <meta property="og:title"  content="{post.title} - {title}" />
	<meta name="twitter:title" content="{post.title} - {title}" />

  <!-- {@html codeStyle} -->
</svelte:head>

<article>
<main>
  <h1><Jittery text="{post.title}" onhover={hoverJitter} /></h1>
  <p>
    Published on: {formatDate(post.date)}
    {#if post.updated}
      <br>
      <em>Updated on: {formatDate(post.updated)}</em>
    {/if}
  </p>
  {#if post.tags}
    <p>Tags: {post.tags.join(', ')}</p>
  {/if}

  <p class="text">
    <slot />
  </p>
</main>
</article>

<style lang="scss">
  .text {
    text-align: left;
    width: 70%;
    margin-left: 15%;
  }

  @media (600px < width <= 1080px) {
    .text {
      width: 80%;
      margin-left: 10%;
    }
	}

  @media (width <= 600px) {
    .text {
      width: 90%;
      margin-left: 5%;
    }
	}
</style>
