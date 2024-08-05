<script lang="ts">
  import { url } from '$lib/config';
  import { filteredPostTable } from '$util';
  import type { BlogPost } from '$util/types';
  import { base } from '$app/paths';
  import Jittery from '$lib/components/basic/Jittery.svelte';
</script>

<h1><Jittery text="Hi, I'm eightfold!" /></h1>
<p id="pet">This is my blog...</p>

{#each filteredPostTable as post}
  <a href="{base}/blog/{post.slug}">
    <button>
      {post.title}
    </button>
  </a>
  <div />
{/each}

<style lang="scss">
	h1, p#pet {
		font-family: 'Petscopfont', Fallback, sans-serif;
	}
</style>
