<script lang="ts">
	import { base, homepage, debug } from '$lib/config';
  import Jittery from '$components/basic/Jittery.svelte';
  import GradientBg from '$lib/components/GradientBg.svelte'
  import '$styles/style.scss'

  import { spring } from 'svelte/motion';

	let coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.15,
		damping: 0.05
	});

  let size = spring(1);
  let light = spring(220);
  let a_light = spring(1.0);

  // let color_light = 255;
  $: color_light = $light;
  $:  color_dark  = 0;
  $:  a_dark  = 0.8;

  $: sx = 0;
  $: vsx = 10 - sx;
  $: sy = 5;
  $: vsy = 10 - sy;

  $: rgb_light = `${color_light}, ${color_light}, ${color_light}`
  $: rgb_dark  = `${color_dark}, ${color_dark}, ${color_dark}`
</script>

<svelte:document 
  on:mousemove={(e) => {
    coords.set({ x: e.clientX, y: e.clientY });
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

<GradientBg
  href="{base}/images/grainy-bg.gif"
  position="{$coords.x}px {$coords.y}px"
  slideSpeed={{x: vsx, y: vsy}}
  light="rgba({rgb_light}, {$a_light})"
  dark="rgba({rgb_dark}, {a_dark})"
  width={$size}
  gap={$size}
/>

<h1>
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
			bind:value={a_light}
			type="range"
			min="0"
			max="1"
			step="0.01"
		/>

		<h3>dark ({color_dark}, {a_dark})</h3>
		<input
			bind:value={color_dark}
			type="range"
			min="0"
			max="255"
			step="1"
		/>
    <input
			bind:value={a_dark}
			type="range"
			min="0"
			max="1"
			step="0.01"
		/>
	</label>
</div>
{/if}

<style lang="scss">
  h1 {
    position: absolute;
    text-align: center;
    vertical-align: middle;
    width: 100%;
    height: 100%;
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
