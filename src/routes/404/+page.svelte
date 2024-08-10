<script lang="ts">
  import { base } from '$app/paths';
  import { url } from '$lib/config';
  import Footer from '$components/Footer.svelte';
  import GradientBg from '$components/GradientBg.svelte'
  import '$styles/style.scss'
</script>

<div class="err-layout">
  <GradientBg
    href="@images/blink.gif"
    light="rgba(0,0,0,0)"
    dark="rgba(0,0,0,0)"
    invert={true}
  />
  <h1 id="err">
    Error 404...
  </h1>
  <br>
  <img src="{url}/images/winfun.gif" alt="R.I.P.">
  <div id="return">
    <a href="{url}/main">Go back.</a>
  </div>
  <Footer />
</div>

<style lang="scss">
  @import '$styles/variables';

  #err {
    border-radius: 5px;
    font-size: 60px;
    width: fit-content;
    margin: auto;
    padding-top: 10px;
  }

  #return {
    $light-red: rgba(253, 57, 57, 0.557);
    background: linear-gradient(
      to right bottom,
      $light-red,
      $clear
    );
    font-size: 30px;
    padding-top: 5px;
    padding-left: 5px;
    border-radius: 10px;
    width: fit-content;
    margin: auto;

    &:hover {
      background: $light-red;
    }
  }

  a {
    filter: brightness(125%);
		&:hover {
			filter: brightness(150%);
			text-decoration: none;
		}
		&:link, &:active, &:visited {
			color: inherit;
			text-decoration: none;
		}
	}

  .err-layout {
    $white-partial: rgba(255, 255, 255, 0.7);
    background: linear-gradient(to right, 
      $white-partial, 
      white, white, 
      $white-partial
    );
    color: darkred;
    text-align: center;
    border-top-left-radius:     $border-radius;
    border-bottom-right-radius: $border-radius;
  }
</style>
