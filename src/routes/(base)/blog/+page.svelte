<script lang="ts">
  import { url } from '$lib/config';
  import { filteredPostTable, blogUrl } from '$util';
  import type { BlogPost } from '$util/types';
  import dateformat from 'dateformat';
  import Jittery from '$lib/components/basic/Jittery.svelte';

  function formatDate(date: string) {
    return dateformat(date, "UTC:mmmm dd, yyyy");
  }
</script>

<h1>
  <Jittery text="All blog posts:" onhover={true} />
</h1>

<p>(Buttons are temporary)</p>

<div id="posts">
{#each filteredPostTable as post}
  <a class="post"
    href="{blogUrl}/{post.slug}"
  >
    <div>
      <b>{post.title}</b>

      <p>Published on: {formatDate(post.date)}</p>
      {#if post.updated}
        <p>Updated on: {formatDate(post.updated)}</p>
      {/if}

      <p>{post.excerpt ?? ''}</p>
    </div>
  </a>
  <div />
{/each}
</div>

<style lang="scss">
  @use 'sass:color';
  @import '$styles/variables';

	h1 {
		font-family: 'Petscopfont', Fallback, sans-serif;
	}

  #posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .post {
    $bg-color: color.change(
      color.mix($tea, $light-eggplant, 20%),
      $alpha: 0.5
    );

    background-color: $bg-color;
    border-radius: 10px;
    width: 75%;

    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 5px;

    &:link, &:active, &:visited {
			color: inherit;
			text-decoration: none;
		}

    &:hover {
      background-color: color.scale(
        $bg-color,
        $lightness: 50%,
        $saturation: 30%
      );
      background-image: url("/bg/blossom.gif");
    }
  }
</style>
