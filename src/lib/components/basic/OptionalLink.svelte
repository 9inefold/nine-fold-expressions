<script lang="ts">
  export let href: string | undefined = undefined;
  export let target: string = "_self";
</script>

{#if href && href.length}
<a href="{href}" target="{target}" {...$$restProps}>
  <slot />
</a>
{:else}
<p {...$$restProps}>
  <slot />
</p>
{/if}
