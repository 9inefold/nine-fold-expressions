<script lang="ts">
  import type { BlogPost } from '$util/types';
  import Post from '$components/Post.svelte'
  import GradientBg from '$components/GradientBg.svelte'
  import DefaultLayout from '$components/DefaultLayout.svelte'
  import '$styles/style.scss'

  export let data: { post: BlogPost };
	$: ({ post } = data);
</script>

{#if post}
<DefaultLayout>
  <GradientBg />
  <Post post={post}>
    {@html post.html}
  </Post>
</DefaultLayout>
{:else}
<div class="wrap">
  <GradientBg
    href="@images/blink.gif"
    light="rgba(0,0,0,0)"
    dark="rgba(0,0,0,0)"
    invert={true}
  />
  <h1 id="err">
    Fatal error.
  </h1>
</div>
{/if}

<style lang="scss">
  #err {
    color: black;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 5px;
    width: fit-content;
    font-size: 60px;
  }

  .wrap {
    text-align: center;
  }
</style>
