<script lang="ts">
  import { url } from '$lib/config';
  import { filteredPostTable, blogUrl } from '$util';
  import type { BlogPost } from '$util/types';
  import Jittery from '$lib/components/basic/Jittery.svelte';
</script>

<h1>
  <Jittery text="All blog posts:" onhover={true} />
</h1>

{#each filteredPostTable as post}
  <a href="{blogUrl}/{post.slug}">
    <button>
      {post.title}
    </button>
  </a>
  <div />
{/each}

<style lang="scss">
	h1 {
		font-family: 'Petscopfont', Fallback, sans-serif;
	}
</style>
