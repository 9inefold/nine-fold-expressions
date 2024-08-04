<script>
	import { onMount } from 'svelte';
	import { paint } from '$lib/util/gradient';
  import { url } from '$lib/config';
</script>

<h1 id="jittery">
	I call it cappuchino :coffee: ...
</h1>

<body>
	<div />
</body>

<style type="scss">
	h1#jittery {
		font-family: 'Petscopfont', Fallback, sans-serif;
		text-shadow: rgb(249, 219, 193) 1px 0 10px;

		animation-name: shake;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
	}

	@keyframes shake {
    0%   { transform: translate(1px, 1px) 	rotate(0deg);  }
    10%  { transform: translate(-1px, -2px)	rotate(-1deg); }
    20%  { transform: translate(-3px, 0px)	rotate(1deg);  }
    30%  { transform: translate(3px, 2px) 	rotate(0deg);  }
    40%  { transform: translate(1px, -1px) 	rotate(1deg);  }
    50%  { transform: translate(-1px, 2px)	rotate(-1deg); }
    60%  { transform: translate(-3px, 1px)	rotate(0deg);  }
    70%  { transform: translate(3px, 1px) 	rotate(-1deg); }
    80%  { transform: translate(-1px, -1px)	rotate(1deg);  }
    90%  { transform: translate(1px, 2px) 	rotate(0deg);  }
    100% { transform: translate(1px, -2px) 	rotate(-1deg); }
	}
</style>
