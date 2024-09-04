<script lang="ts">
  import Post from '$components/Post.svelte'
  import type { BlogPost } from '$util/types';
  // import 'svelte-highlight/styles/paraiso-dark.css';
  export let post: BlogPost | undefined;
</script>

<div id="empty">
{#if post}
  <Post post={post}>
    <slot />
  </Post>
{/if}
</div>

<style lang="scss">
  #empty {
    text-align: center;
  }
</style>
