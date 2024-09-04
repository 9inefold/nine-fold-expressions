<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { paint } from '$lib/util/gradient';
	import { title } from '$lib/config';

  export let size: number = 32;
  export let animated: boolean = true;
  
  let canvas: HTMLCanvasElement;
  const idname = 'eightfoldLogoCanvas';
  const maxRot = 22.5;

  const progress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

  $: styleProps = `
    transform: rotate(${$progress}deg);
    filter:
      brightness(${1 + ($progress / maxRot)})
      hue-rotate(${$progress * 2}deg);
      
  `;

  onMount(() => {
    if (!animated)
      return () => {};

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    let frame = requestAnimationFrame(function loop(t) {
			frame = requestAnimationFrame(loop);
			paint(context, t);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
  });
</script>

{#if animated}
  <canvas
    bind:this={canvas}
    id={idname}
    height={size}
    width={size}
    on:mouseleave={() => progress.set(0)}
    on:mouseenter={() => progress.set(maxRot)}
    style="{styleProps}"
  >
    <slot />
  </canvas>
{:else}
  <img
    src="/favicons/favicon.png"
    alt={title}
    height={size}
    width={size}
  />
{/if}

<style lang="scss">
	#eightfoldLogoCanvas {
    display: flex;
    padding: 0%;
		background-color: #00000000;
		touch-action: none;

    mask: url(/images/eightfold-mask2.svg) 50% 50% no-repeat;
    mask-size: 100%;
	}
</style>
