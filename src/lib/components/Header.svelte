<script>
	import { base } from '$app/paths';
	import { title, homepage } from '$lib/config';
	import Logo from '$components/basic/Logo.svelte'
</script>

<header>
	<a id="aname" href="{homepage}">
		<h1 id="name">{title}</h1>
	</a>
	<div class="subheader">
		<a id="logo" href="{homepage}">
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
	</div>
</header>

<style lang="scss">
	header {
		background: rgb(87, 58, 176);
		background: rgb(200, 228, 158);
		align-items: center;
		justify-content: center;
	}

	.subheader {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	a {
		text-decoration: none;
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
	}

	#logo {
		z-index: 11;
		padding: .5rem;
		color: inherit;
		user-select: all;
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

	nav {
		vertical-align: center;
	}

	ul {
		position: relative;
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
