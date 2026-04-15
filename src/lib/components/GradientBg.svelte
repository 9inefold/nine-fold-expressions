<script lang="ts">
  import { makeCssUrl } from "$util/url";
  import { vfx } from "$util/stores";
  type Pos = { x: number; y:number; };

  export let href  = `/images/space-bg.gif`;
  export let opacity = 100;
  export let position = "top left";
  export let invert = false;
  export let slide = true;
  export let slideSpeed: Pos = { x: 10, y: 5 };
  export let light = "red";
  export let dark  = "magenta";
  export let width = 2;
  export let gap   = 3;

  $: frequency = 0.05;
  $: scale = 50;
  $: canvasScale = 330;

  $: cssurl = makeCssUrl(href);
  $: style = `
  filter:
    invert(${invert ? 100 : 0}%)
    opacity(${opacity}%);
  background:
    repeating-radial-gradient(
      circle at ${position},
      ${light},
      ${dark}  ${width}px,
      ${dark}  ${width + gap}px,
      ${light} ${width + gap * 2}px
    ), ${cssurl};
  `;
  $: style_slide = `
    animation-duration:${slideSpeed.y}s,${slideSpeed.x}s;
  `;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (I don't care!!!) -->
<div id="bg"
  class:slide={slide && !$vfx}
  style="{style}{style_slide}"
  on:click={() => $vfx = !$vfx}
/>



{#if !debug}

<svg class="bg-filter">
  <filter id="ripple-filter">
    <feGaussianBlur stdDeviation="0" />
  </filter>
  This isn't hidden so firefox can load the filters!
</svg>

{:else}

<!--
<filter id="ripple-filter">
  <feGaussianBlur stdDeviation="1" />
  <feMorphology operator="dilate" radius="1" />
</filter>
-->

<svg xmlns="http://www.w3.org/2000/svg" class="displacementmap" id="absolute-displacementmap" width="100" height="100" preserveAspectRatio="none">
    <defs>
        <style type="text/css">
            .gradient {
                fill: url(#gradient);
                }
        </style>

        <radialGradient id="gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="80%" style="stop-color:rgb(128,0,128); stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(128,0,128); stop-opacity:0" />
        </radialGradient>
    </defs>
    <rect width="100%" height="100%" x="0" y="0" fill="url(#gradient)"/>
</svg>

<svg class="test-svg" width="{canvasScale}" height="{canvasScale}">
  <filter id="test-filter">
    <feTurbulence
      type="turbulence"
      baseFrequency="{frequency}"
      numOctaves="2"
      result="turbulence" />
    <feDisplacementMap
      in2="turbulence"
      in="SourceGraphic"
      scale="{scale}"
      xChannelSelector="R"
      yChannelSelector="G" />
  </filter>
  <circle cx="35%" cy="35%" r="100" fill="white" filter="url(#test-filter)" />
  <rect x="0" y="0" width="100%" height="100%" fill="grey" fill-opacity="25%" filter="url(#test-filter)" />
</svg>

<div class="controls">
  <label id="stuff">
	<h3>baseFrequency: {frequency}</h3>
	<input
		bind:value={frequency}
		type="range"
		min="0.00"
		max="0.50"
		step="0.01"
	/>
  <h3>scale: {scale}</h3>
	<input
		bind:value={scale}
		type="range"
		min="0"
		max="1000"
		step="1"
	/>

  <h3>canvas: {canvasScale}x{canvasScale}</h3>
	<input
		bind:value={canvasScale}
		type="range"
		min="220"
		max="2200"
		step="100"
	/>
	</label>
</div>

{/if}

<style lang="scss">
  .slide {
    animation: 
      slide-y 5s linear infinite,
      slide-x 10s linear infinite;
    animation-composition: add;
  }

  #bg {
    animation-composition: add;
    background-blend-mode: color-dodge;
    filter: contrast(1);
    transform: translate3d(0, 0, 0);
    
    position: fixed;
    z-index: -11;
    width: 100%;
    height: 100%;
    height: 100vh;
    background-size: contain;
    opacity: 100%;
    left: 0px;
    top: 0px;
    bottom: 0;
  }

  @keyframes slide-x {
    from { background-position: left; }
    to { background-position: right; }
  }
  @keyframes slide-y {
    from { background-position: bottom; }
    to { background-position: top; }
  }
</style>
