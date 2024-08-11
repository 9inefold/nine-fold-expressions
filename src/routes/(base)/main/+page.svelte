<script>
  import { base, url } from '$lib/config';
	import Jittery from '$components/basic/Jittery.svelte';
	import Image from '$components/basic/Image.svelte'
</script>

<h1 id="jittery">
	<Jittery text="I call it cappuchino :coffee: ..." />
</h1>

<h1><Jittery text="Hi, I'm eightfold!" /></h1>
<p id="pet">This is my blog...</p>

<body>
	<div />
	<div id="scroller">
		<div id="scrolling">
			<Jittery text={"\u{1F6E0} Currently under \
				construction............ \u{1F6E0}"} janky={true} />
		</div>
	</div>
</body>

<style lang="scss">
	@use 'sass:math';

	h1 {
		text-shadow: rgb(249, 219, 193) 1px 0 10px;
	}

	#jittery {
		display: none;
	}

	#scroller {
		overflow: hidden;
		overflow-block: clip;
		overflow-wrap: normal;
		$width: 35%;
		width: $width;
		margin-left: 50% - math.div($width, 2);
	}

	#scrolling {
		// Workaround for disabling emojis
		font-family: monospace;
		white-space: nowrap;
		animation: my-animation 10s linear infinite;
	}

	@media (480px < width <= 720px) {
		#scroller {
			$width: 50%;
			width: $width;
			margin-left: 50% - math.div($width, 2);
		}
	}

	@media (width <= 480px) {
		#scroller {
			$width: 75%;
			width: $width;
			margin-left: 50% - math.div($width, 2);
		}
	}

	@keyframes my-animation {
	  from {
	    -moz-transform: translateX(100%);
	    -webkit-transform: translateX(100%);
	    transform: translateX(100%);
	  }
	  to {
	    -moz-transform: translateX(-100%);
	    -webkit-transform: translateX(-100%);
	    transform: translateX(-100%);
	  }
	}

	h1, p#pet {
		font-family: 'Petscopfont', Fallback, sans-serif;
	}
</style>
