<script>
	import { base } from '$app/paths';
  import Stars from '$components/basic/Stars.svelte';
  import Icon from '$components/basic/Icon.svelte';
  const size = 50;
</script>

<footer>
  <br>
  <Stars />
  <p>
    Powered by <a
      href="https://kit.svelte.dev/"
      target="_blank"
      rel="noopener noreferrer"
    >SvelteKit</a>.
  </p>
  <p id="links"
    style:height="{size}px"
  >
    <Icon
      src="/icons/github.png"
      alt="github"
      size={size}
      href="https://github.com/9inefold"
      target="_blank"
      rel="author external me"
    />
<!--
    <Icon
      src="/icons/youtube.png"
      alt="youtube"
      size={size}
      href="https://www.youtube.com/@8ightfold"
      target="_blank"
      rel="author external me"
    />
-->
  </p>
  <p id="cpy">&copy; ninefold {new Date().getFullYear()}</p>
</footer>

<style lang="scss">
  footer #cpy {
    padding-bottom: 1rem;
  }

  footer #links {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 1rem;
  }

  a {
    filter: brightness(125%);
    text-decoration: underline;
		&:hover {
			filter: brightness(150%);
			text-decoration: none;
		}
		&:active, &:visited {
			color: inherit;
			text-decoration: none;
		}
	}
</style>
