<script lang="ts">
  import OptionalLink from '$components/basic/OptionalLink.svelte'
  import { makeUrl, makeCssUrl } from "$util/url";

  export let src: string;
  export let alt: string;

  export let size: number = 32;
  export let animated: boolean = true;
  export let href: string | undefined = undefined;
</script>

<OptionalLink href={href} {...$$restProps} style="width:{size}px; height:{size}px;">
{#if animated}
  <img class="anim"
    src="{makeUrl("/bg/orange-glitter.gif")}"
    alt="{alt}"
    height={size}
    width={size}
    style:mask-image="{makeCssUrl(src)}"
  />
{:else}
  <img
    src="{src}"
    alt="{alt}"
    height={size}
    width={size}
  />
{/if}
</OptionalLink>

<style lang="scss">
  .anim {
    filter: hue-rotate(-25deg) brightness(80%);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-mode: alpha;
  }
	.anim:hover {
    filter: none;
		transform: scale(150%) rotate(-22.5deg);
  }
</style>
