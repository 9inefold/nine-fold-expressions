<script lang="ts">
  import { url } from '$lib/config';
  import { filteredPostTable } from '$util';
  import type { BlogPost } from '$util/types';
</script>

<h1>Hi, I'm eightfold!</h1>
<p>This is my blog...</p>

{#each filteredPostTable as post}
  <a href={url + "blog/" + post.slug}>
    <button>
      {post.title}
    </button>
  </a>
  <div />
{/each}
