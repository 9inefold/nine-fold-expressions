<script>
  import { title, keywords } from '$lib/config'
  import GradientBg from '$components/GradientBg.svelte'
  import DefaultLayout from '$components/DefaultLayout.svelte'
</script>

<svelte:head>
  <meta name="keywords" content={keywords.join(', ')} />
  <title>{title}</title>
  <meta property="og:title"  content="{title}" />
	<meta name="twitter:title" content="{title}" />
</svelte:head>

<DefaultLayout>
  <main>
    <GradientBg />
    <slot />
  </main>
</DefaultLayout>
