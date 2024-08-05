<script>
	import { onMount } from 'svelte';
	import { paint } from '$lib/util/gradient';
  import { url } from '$lib/config';
	import Jittery from '$components/basic/Jittery.svelte';
</script>

<h1 id="jittery">
	<Jittery text="I call it cappuchino :coffee: ..." />
</h1>

<body>
	<div />
</body>

<style lang="scss">
	h1#jittery {
		text-shadow: rgb(249, 219, 193) 1px 0 10px;
	}
</style>
