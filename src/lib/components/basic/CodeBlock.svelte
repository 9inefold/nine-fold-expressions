<script lang="ts">
  import Highlight, { LineNumbers } from 'svelte-highlight';
  import {
    c, cpp, csharp, haskell,
    java, llvm, rust, typescript, x86asm
  } from 'svelte-highlight/languages';

  type LangName =
    'c' |'cpp' | 'cs' | 'hs' | 
    'java' | 'llvm' | 'rs' | 'ts' | 'x86';
	export let lang: LangName = 'cpp';
  export let langtag: boolean = true;
  // export let showlines: boolean = true;

  const langMatch = (lang: LangName) => {
    switch (lang) {
      case 'c':     return c;
      case 'cpp':   return cpp;
      case 'cs':    return csharp;
      case 'hs':    return haskell;
      case 'java':  return java;
      case 'llvm':  return llvm;
      case 'rs':    return rust;
      case 'ts':    return typescript;
      case 'x86':   return x86asm;
    }
  }

  let data: HTMLSpanElement;

  $: langv = langMatch(lang);
  $: text = (data?.innerText) ?? '';
</script>

<span id="capture" bind:this={data}>
  <slot />
</span>

<Highlight language={langv} code={text} langtag={langtag} />

<style lang="scss">
  #capture {
    display: none;
  }

	:global(pre) {
    background-color: var(--background-950);
    padding: 1px;
    border-radius: calc(.5rem + 1px);
    box-shadow: 0px 0px 7rem color-mix(in srgb, var(--primary-500) 10%, transparent);

    & > :global(code) {
      color: var(--text-50);
      display: block;
      background-color: var(--background-950);
      border: 1px color-mix(in srgb, var(--background-300) 50%, transparent) solid;
      padding: 1rem;
      border-radius: .5rem;
      tab-size: 4;
    }
  }
</style>
