<script lang="ts">
  import { url } from '$lib/config';
  import Jittery from '$lib/components/basic/Jittery.svelte';
</script>

<h1><Jittery text="About me (and the site):" /></h1>
<div id="block">
  <p>
    Hi, I'm ninefold! A fair amount of people have asked me to make a blog,
    and I finally have. It was actually more fun to work on than I expected!
  </p>
  <p>
    If you don't know me, I'm mainly a C/C++ programmer who works on some...
    <a 
      href="https://github.com/9inefold/headless-compiler"
      target="_blank"
      rel="author external noopener"
    >"insane"</a> projects.
  </p>
  <p>
    The point of this blog is threefold <i>(haha)</i>:
  </p>
  <ul>
    <li>Document and break down parts of my projects.</li>
    <li>Get up to speed with modern web frameworks.</li>
    <li>Test the various design ideas I come up with.</li>
  </ul>

  <img src="{url}/images/gear.gif" alt="⚙">

  <p>
    There are a lot of "corporate-style" websites today, generally made with
    templates, aiming to look as clean and modern as possible...
  </p>
  <p style="font-size:24px;">And I don't like it.</p>
  <p>
    While it's great if you're running a business, it's not for a personal site.
    That is the one place where you absolutely should be adding character.
  </p>
  <p>
    This site was made in a late 90's/early 00's style, as that was what
    I saw growing up (though, even then it was going out of fashion). <br>

    And although this <i>is</i> in a retro style, I used Svelte and modern CSS.
  </p>

  <img src="{url}/images/gear.gif" alt="⚙">

  <p>
    I'm not 100% sure how much I'll be posting, but hopefully every
    couple months or so. Eventually I'll move some of it over to Youtube.
  </p>
</div>

<style lang="scss">
  #block {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 1.75rem;
    overflow: visible;
  }

  p {
    max-width: 70%;
    margin-left:  15%;
    margin-right: 15%;
    text-align: center;
  }

  ul {
    max-width: 70%;
    margin-left:  20%;
    margin-right: 20%;
    text-align: center;
    padding-left: 0;
  }

  @media (400px < width <= 860px) {
    #block {
      font-size: 18px;
      line-height: 2rem;
    }
    h1 {
      font-size: 24px;
    }
		p {
      max-width: 100%;
      margin-left: 10%;
      margin-right: 10%;
      padding-left: 0;
    }

    ul {
      max-width: 100%;
      margin-left: 10%;
      margin-right: 10%;
    }
	}

  @media (width <= 400px) {
    h1 {
      font-size: 16px;
    }
	}

  li {
    max-width: inherit;
    margin-left: inherit;
    text-align: left;
  }

  a {
    filter: brightness(125%);
		&:hover {
			filter: brightness(150%);
			text-decoration: none;
		}
		&:link, &:active, &:visited {
			color: inherit;
			text-decoration: none;
		}
	}

  img {
    font-size: 3em;
    padding-top: 10px;
  }
</style>
