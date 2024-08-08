<script>
	import { base } from '$app/paths';
  import Stars from '$components/basic/Stars.svelte'
</script>

<footer>
  <br>
  <Stars />
  <p>&copy; eightfold {new Date().getFullYear()}</p>
</footer>

<style lang="scss">
  footer p {
    padding-bottom: 1rem;
  }
</style>
