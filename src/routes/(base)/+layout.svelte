<script>
  import { title, keywords } from '$lib/config'
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import GradientBg from '$lib/components/GradientBg.svelte'
  import '$styles/style.scss'
</script>

<svelte:head>
  <meta name="keywords" content={keywords.join(', ')} />
  <title>{title}</title>
  <meta property="og:title"  content="{title}" />
	<meta name="twitter:title" content="{title}" />
</svelte:head>

<Header />
<main>
  <GradientBg />
  <slot />
</main>
<Footer />
