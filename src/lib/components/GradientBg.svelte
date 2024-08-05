<script lang="ts">
  type Pos = { x: number; y:number; };

  export let href  = "/images/space-bg.gif";
  export let position = "top left";
  export let slide = true;
  export let slideSpeed: Pos = { x: 10, y: 5 };
  export let light = "red";
  export let dark  = "magenta";
  export let width = 2;
  export let gap   = 3;

  $: style = `
  background:
    repeating-radial-gradient(
      circle at ${position},
      ${light},
      ${dark}  ${width}px,
      ${dark}  ${width + gap}px,
      ${light} ${width + gap * 2}px
    ), url("${href}");
  `;
  $: style_slide = `
    animation-duration:${slideSpeed.y}s,${slideSpeed.x}s;
  `;
</script>

{#if slide}
  <div id="bg" class="slide" style="{style}{style_slide}" />
{:else}
  <div id="bg" style="{style};" />
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
    
    position: absolute;
    z-index: -11;
    width: 100%;
    opacity: 100%;
    top: 0px;
    bottom: 0;
    left: 0px;
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
