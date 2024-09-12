<script lang="ts">
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import Post from '$components/Post.svelte'
  import type { BlogPost } from '$util/types';
  import '$styles/style.scss';
  import '$styles/hl/paraiso-dark.css';
  // import 'svelte-highlight/styles/srcery.css';
  import pdark from 'svelte-highlight/styles/paraiso-dark';
  // import pojoaque from 'svelte-highlight/styles/pojoaque';

  export let post: BlogPost | undefined;
</script>

<div class="my-layout">
  <Header />
{#if post}
  <Post post={post} codeStyle={pdark}>
    <slot />
  </Post>
{/if}
  <Footer />
</div>

<style lang="scss">
  @import '$styles/variables';

  .my-layout {
    $white-partial: rgba(255, 255, 255, 0.7);
    background: linear-gradient(to right, 
      $white-partial, 
      white, white, 
      $white-partial
    );
    color: teal;
    text-align: center;
    border-top-left-radius:     $border-radius;
    border-bottom-right-radius: $border-radius;
  }
</style>
