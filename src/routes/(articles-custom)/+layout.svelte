<script lang="ts">
  import type { BlogPost } from '$util/types';
  import Post from '$components/Post.svelte'
  import Binder from '$components/Binder.svelte'
  import GradientBg from '$components/GradientBg.svelte'
  import DefaultLayout from '$components/DefaultLayout.svelte'

  export let data: { post: BlogPost };
	$: ({ post } = data);
</script>

{#if post}
  {#if post.component === false}
    <DefaultLayout>
      <GradientBg />
      <Post post={post}>
        <slot />
      </Post>
    </DefaultLayout>
  {:else}
    <Binder post={post}>
      <slot />
    </Binder>
  {/if}
{:else}
  <h1>Fatal error.</h1>
{/if}
