<script lang="ts">
  import type { Preferences } from '$util/types';
  import { vfx, getStore, setStore } from '$util/stores';
  import { browser } from '$app/environment';
  import { setCookie } from '$util/cookies';

  export let data: Preferences;
  $vfx = data.vfx;

  if (browser) {
    let storedVfx = getStore('vfx', false);
    // Prefer local storage.
    $vfx = storedVfx ?? $vfx;
  }

  $: {
    browser && setStore('vfx', $vfx);
    browser && setCookie('vfx', $vfx);
  }
</script>

<slot />
