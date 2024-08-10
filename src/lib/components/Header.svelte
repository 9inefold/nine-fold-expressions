<script>
	import { base } from '$app/paths';
	import { title, homepage } from '$lib/config';
	import Jittery from '$components/basic/Jittery.svelte';
	import Logo from '$components/basic/Logo.svelte'
</script>

<header>
	<a id="aname" href="{homepage}">
		<h1 id="name">
			<Jittery text="{title}" onhover={true} />
		</h1>
	</a>
	<div class="subheader">
		<a id="logo" href="{homepage}">
			<Logo size={60} />
		</a>
		<nav>
			<ul>
				<a href="{base}/blog">Blog</a>
				<a href="{base}/about">About</a>
			</ul>
		</nav>
	</div>
</header>

<style lang="scss">
	@use 'sass:color';
	@import '$styles/variables';

	header {
		$lighter: color.mix($sulfur-smoke, white, 70%);
		background: linear-gradient(to right,
			$sulfur-smoke, $lighter, $sulfur-smoke
		);
		align-items: center;
		justify-content: center;
		border-top-left-radius: $border-radius;
	}

	.subheader {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	a {
		&:hover {
			filter: brightness(110%);
			text-decoration: none;
		}
		&:link, &:active, &:visited{
			color: inherit;
			text-decoration: none;
		}
	}

	#aname {
		z-index: 10;
		height: inherit;
		left: 0%;
		width: 100%;
		position: absolute;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		vertical-align: middle;
	}

	#name {
		color: hsl(300, 47%, 75%);
		text-shadow: 2px 2px hsl(295, 50%, 50%);
		font-size: 32px;
		user-select: none;
		width: max-content;
		// animation: spinny 4s linear 0ms infinite alternate both;
		animation: ping 4s linear 1s infinite normal both;
	}

	@media (480px < width <= 720px) {
		#name {
			font-size: 28px;
		}
	}

	@media (width <= 480px) {
		#aname {
			display: inline;
		}

		#name {
			font-size: 24px;
			margin-left: 25%;
			margin-top: 30px;
		}
	}

	#logo {
		padding: .5rem;
		color: inherit;
		user-select: all;
		z-index: 11;
	}

	nav {
		vertical-align: center;
		z-index: 11;
	}

	ul {
		position: relative;
		color: $tea;
		transform: translateY(25%);
		padding: 1rem;
		margin: 0;
		list-style-type: none;
		display: flex;
		gap: 1rem;
	}

	@mixin s($rot, $scale) {
		transform:
			scale($scale, 1)
			rotate(#{$rot}deg);
	}

	@keyframes spinny {
		0% 	 { @include s(0, 		1); }
		10%  { @include s(20, 	1); }
		20%  { @include s(0, 	  1); }
		30%  { @include s(-20, 	0.95); }
		50%  { @include s(0, 	  1); }
		60%  { @include s(-5, 	1.05); }
		70%  { @include s(0, 		1); }
		80%  { @include s(-5, 	0.9); }
		90%  { @include s(-10, 	0.95); }
		100% { @include s(0, 		1); }
	}

	@mixin p($op, $scl) {
		opacity: $op;
		transform: scale($scl);
	}

	@keyframes ping {
		0% 	 { @include p(0, 	 0.2); }
		10%  { @include p(0.8, 0.27); }
		40%	 { transform: rotateY(90deg); }
		60%	 { transform: rotateY(180deg); }
		75%	 { transform: rotateY(270deg); }
		80%  { @include p(0,   1.5); }
		90%	 { transform: rotateY(360deg); }
		100% { @include p(0, 	 2.8); }
	}
</style>
