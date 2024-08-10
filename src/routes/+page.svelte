<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { base, homepage, debug } from '$lib/config';
  import Jittery from '$components/basic/Jittery.svelte';
  import GradientBg from '$lib/components/GradientBg.svelte'
  import { spring } from 'svelte/motion';
  import '$styles/style.scss'

	onMount(() => {
		const style = document.documentElement.style;
		style.overflowY = 'hidden';
		return () => { style.overflowY = 'scroll'; };
	});

	$: outerWidth = 0;
	$: outerHeight = 0;

	let coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.15,
		damping: 0.05
	});

  let size = spring(1);
  let light = spring(220);
  let a_light = spring(1.0);

  $: color_light = $light;
  $: alpha_light = $a_light;

  $: sx = 0;
  $: vsx = 10 - sx;
  $: sy = 5;
  $: vsy = 10 - sy;

  $: rgb_light = `${color_light}, ${color_light}, ${color_light}`
</script>

<svelte:window bind:outerWidth bind:outerHeight />

<svelte:document
	on:pointerleave={(e) => {
		coords.set({ x: (e.clientX / 2), y: (e.clientY / 2) });
	}}
  on:mousemove={(e) => {
		const x = Math.max(-100, Math.min(e.clientX, outerWidth * 2));
		const y = Math.max(-100, Math.min(e.clientY, outerHeight * 2));
    coords.set({ x: x, y: y });
  }}
  on:mousedown={() => {
    size.set(5);
    light.set(255);
    a_light.set(0.8);
  }}
  on:mouseup={() => {
    size.set(1);
    light.set(220);
    a_light.set(1.0);
  }}
/>

<div id="noscroll">
	<GradientBg
	  href="@images/grainy-bg.gif"
	  position="{$coords.x}px {$coords.y}px"
	  slideSpeed={{x: vsx, y: vsy}}
	  light="rgba({rgb_light}, {alpha_light})"
	  dark="rgba(0, 0, 0, 0.8)"
	  width={$size}
	  gap={$size}
	/>

	<h1 class:scroll-lock={true}>
	  <a href="{homepage}">
	    <Jittery text="Enter..." onhover={true} />
	  </a>
	</h1>

{#if debug}
	<div class="controls">
	  <label id="vals">
			<h3>stiffness ({coords.stiffness})</h3>
			<input
				bind:value={coords.stiffness}
				type="range"
				min="0.01"
				max="1"
				step="0.01"
			/>
			<h3>damping ({coords.damping})</h3>
			<input
				bind:value={coords.damping}
				type="range"
				min="0.01"
				max="1"
				step="0.01"
			/>
		</label>

	  <label id="speed">
		<h3>[sx, sy]</h3>
		<input
			bind:value={sx}
			type="range"
			min="0.1"
			max="10"
			step="0.01"
		/>
		<input
			bind:value={sy}
			type="range"
			min="0.1"
			max="10"
			step="0.01"
		/>
		</label>

		<label id="color">
			<h3>light ({color_light.toFixed(0)}, {$a_light.toFixed(2)})</h3>
			<input
				bind:value={color_light}
				type="range"
				min="0"
				max="255"
				step="1"
			/>
			<input
				bind:value={$a_light}
				type="range"
				min="0"
				max="1"
				step="0.01"
			/>
		</label>
	</div>
{/if}
</div>

<style lang="scss">

  h1 {
    user-select: none;
    position: absolute;
		display: flex;
  	justify-content: center;
  	align-items: center;
    width: 100%;
    height: 100%;
  }

	a {
		color: wheat;
		text-decoration: none;
	}

	.controls {
		position: absolute;
		top: 1em;
		right: 1em;
		width: 200px;
		user-select: none;

    input {
	  	width: 100%;
	  }
	}
</style>
