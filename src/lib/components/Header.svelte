<script>
	import { base } from '$app/paths';
	import { homepage } from '$lib/config';
	import Logo from '$components/basic/Logo.svelte'
</script>

<header>
	<a href="{homepage}">
		<Logo size={60} />
	</a>
	<nav>
		<ul>
			<li>
				<a href="{base}/blog">Blog</a>
			</li>
			<li>
				<a href="{base}/about">About</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		background: rgb(87, 58, 176);
		background: rgb(200, 228, 158);
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	a {
		padding: .5rem;
		text-decoration: none;
		color: inherit;
	}

	ul {
		padding: 1rem;
		margin: 0;
		list-style-type: none;
		display: flex;
		gap: 1rem;
		vertical-align: center;
	}
</style>
