<script lang="ts">
  import { redirect } from '@sveltejs/kit';
  import { browser } from '$app/environment';
  import { goto, preloadData } from '$app/navigation';
  import { base } from '$app/paths';

  $: {
    const baseRedirect = `${base}/post/death-by-erasure/`;
    if (browser) {
      preloadData(baseRedirect);
      goto(baseRedirect);
    } else
      redirect(308, baseRedirect);
  }
</script>
