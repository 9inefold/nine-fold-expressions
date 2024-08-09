<script>
	import { base } from '$app/paths';
  import Stars from '$components/basic/Stars.svelte'
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
  <p id="cpy">&copy; eightfold {new Date().getFullYear()}</p>
</footer>

<style lang="scss">
  footer #cpy {
    padding-bottom: 1rem;
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
