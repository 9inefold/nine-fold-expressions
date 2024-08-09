<script lang="ts">
  import Empty from '$layouts/Empty.svelte';
  import Default from '$layouts/Default.svelte';
  import type { BlogPost } from '$util/types';

  export let post: BlogPost;
  $: kind = post.component as string;

  type BindingType = Record<string, any>;
  const bindings: BindingType = {
    'default':  Default,
    'empty':    Empty,
  }
  $: bound = bindings[kind];
</script>

{#if bound}
  <svelte:component this={bound} post={post}>
    <slot />
  </svelte:component>
{:else}
  <slot />
{/if}
