<script lang="ts">
  import { makeUrl } from "$util/url";

  export let href: string;
  export let alt:  string = "image";
  $: absolute = makeUrl(href);
</script>

{#if href}
  <img src="{absolute}" alt="{alt}">
{:else}
  <div>Image could not be found.</div>
{/if}
