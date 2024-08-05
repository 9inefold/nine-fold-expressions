<script>
	import { base } from '$app/paths';
</script>

<footer>
  <br>
  <img
    id="stars"
    src="{base}/images/rainbowstarline.gif"
    alt="-----------------------------"
  >
  <p>&copy; eightfold {new Date().getFullYear()}</p>
</footer>

<style lang="scss">
  footer {
    p { padding-bottom: 1rem; }
    img {
      animation: float 2s ease infinite;
      max-width: 100%;
    }
  }

  @mixin t($y, $sk: 0) {
    transform:
      translateY($y - 3px);
    filter: drop-shadow(0 0 0.75rem 
      rgb(250, 242, 135, $sk));
  }

  @keyframes float {
    $pixel-size: 5px;
    0%  {  @include t( $pixel-size); }
    50% {  @include t(-$pixel-size, 255); }
    100% { @include t( $pixel-size); }
  }
</style>
