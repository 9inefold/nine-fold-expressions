<script lang="ts">
  import { debug } from '$lib/config';
  import { onMount, onDestroy } from 'svelte';
  
  let readingProgress;

  // Adapted from cloudflare :)
  function updateScrollBar() {
    if (!readingProgress) {
      if (debug)
        console.warn("Could not locate .reading-progress");
      return;
    }

    const post = document.querySelector("#blogpost");
    if (!post || !('clientHeight' in post)) {
      if (debug)
        console.warn("Could not locate #blogpost for .reading-progress");
      return;
    }

    const clientRect = post.getBoundingClientRect();
    const postTop = clientRect.top;

    const footer = document.querySelector("footer");
    // Add a bit of extra space so it doesn't end too early.
    const footerExtra = (footer?.clientHeight ?? 0) * 0.15;

    const postHeight = post.clientHeight - window.innerHeight + footerExtra;
    if (postHeight <= 0) {
      readingProgress.setAttribute("value", 0);
      return;
    }

    const pos = Math.max(-postTop, 0);
    const out = (pos / postHeight) * 100;
    readingProgress.setAttribute("value", out);
  }

  function listener(): number {
    return requestAnimationFrame(updateScrollBar);
  }

  onMount(() => {
    if (debug)
      console.log('Added scrollbar event listeners');
    addEventListener('scroll', listener);
    addEventListener('resize', listener);
    updateScrollBar();
  })
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      if (debug)
        console.log('Removed scrollbar event listeners');
      removeEventListener('scroll', listener);
      removeEventListener('resize', listener);
    }
  })
</script>

<progress class="reading-progress" bind:this={readingProgress}
          value="0" max="100"
          aria-label="Reading progress">
</progress>

<style lang="scss">
  @import '$styles/variables';

  $progress-fg: rgb(158, 28, 112);
  $progress-bg: rgb(255 255 255 / 10%);

  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 5px;

    border: none;
    background-color: $progress-bg;

    -webkit-appearance:none;
    -moz-appearance:none;
    appearance:none
  }

  @supports selector(::-webkit-progress-bar) {
    .reading-progress::-webkit-progress-bar {
      background-color: $progress-bg;
    }
    .reading-progress::-webkit-progress-value {
      background: $progress-fg;
    }
  }

  @supports selector(::-moz-progress-bar) {
    .reading-progress::-moz-progress-bar {
      background-color: $progress-fg;
    }
  }
</style>
