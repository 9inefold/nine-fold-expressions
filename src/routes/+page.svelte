<script>
	import { spring } from 'svelte/motion';
	import { onMount } from 'svelte';
	import { paint } from '$lib/gradient.js';

	onMount(() => {
		const canvas = document.querySelector('canvas');
		const context = canvas?.getContext('2d');

		let frame = requestAnimationFrame(function loop(t) {
			frame = requestAnimationFrame(loop);
			paint(context, t);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});

	let coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.1,
		damping: 0.25
	});
	let size = spring(10);
</script>

<h1>I call it cappuchino :coffee: ...</h1>

<canvas
	width={32}
	height={32}
></canvas>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
	on:mousemove={(e) => {
		coords.set({ x: e.clientX, y: e.clientY });
	}}
	on:mousedown={() => size.set(30)}
	on:mouseup={() => size.set(10)}
>
	<circle
		cx={$coords.x}
		cy={$coords.y}
		r={$size}
	/>
</svg>

<div class="controls">
	<label>
		<h3>stiffness ({coords.stiffness})</h3>
		<input
			bind:value={coords.stiffness}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>

	<label>
		<h3>damping ({coords.damping})</h3>
		<input
			bind:value={coords.damping}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>
</div>

<style>
	svg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	canvas {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: #666;
		mask: url(/images/eightfold-mask.svg) 50% 50% no-repeat;
		mask-size: 60vmin;
		-webkit-mask: url(/images/eightfold-mask.svg) 50% 50% no-repeat;
		-webkit-mask-size: 60vmin;
	}

	circle {
		fill: #ff3e00;
	}

	.controls {
		position: absolute;
		top: 1em;
		right: 1em;
		width: 200px;
		user-select: none;
	}

	.controls input {
		width: 100%;
	}
</style>
