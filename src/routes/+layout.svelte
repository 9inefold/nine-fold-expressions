<script>
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import '$styles/style.scss'
</script>

<Header />

<main>
  <div class="bg" />
  <slot />
</main>

<Footer />

<style lang="scss">
  .bg {
    $color-bright: red;
    $color-dark: magenta;
    --line-width: 2px;
    --line-gap:   3px;

    background: repeating-radial-gradient(
      circle at top left,
      $color-bright,
      $color-dark var(--line-gap),
      $color-dark calc(var(--line-width) + var(--line-gap)),
      $color-bright calc((var(--line-width) + var(--line-gap)) * 2)
    ), url("/images/space-bg.gif");
    background-blend-mode: color-dodge;
    animation: slide-it 10s linear infinite;
    filter: contrast(1);
    
    position: absolute;
    z-index: -11;
    width: 100%;
    opacity: 100%;
    top: 0px;
    bottom: 0;
    left: 0px;
  }

  @keyframes slide-it {
    from {
      background-position: bottom left;
    }
    to {
      background-position: top right;
    }
  }

  /*
  .bg::after {
    $color-bright: red;
    $color-dark: magenta;
    --line-width: 2px;
    --line-gap:   3px;

    content: "";
    inset: 0;
    position: absolute;

    background: repeating-radial-gradient(
      circle at top left,
      $color-bright,
      $color-dark var(--line-gap),
      $color-dark calc(var(--line-width) + var(--line-gap)),
      $color-bright calc((var(--line-width) + var(--line-gap)) * 2)
    ), url("/images/space-bg.gif");
    background-blend-mode: color-dodge;
    opacity: 70%;
  }
  */
</style>
