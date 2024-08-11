<script lang="ts">
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import '$styles/style.scss'
</script>

<div class="base-layout">
  <Header />
  <slot />
  <Footer />
</div>

<style lang="scss">
  @import '$styles/variables';

  .base-layout {
    background: linear-gradient(
      $light-eggplant, $dark-eggplant
    );
    color: $text-color;
    text-align: center;
    border-top-left-radius:     $border-radius;
    border-bottom-right-radius: $border-radius;
  }
</style>
