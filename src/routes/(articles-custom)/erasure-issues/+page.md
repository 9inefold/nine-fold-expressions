---
title: Folder test blog post!
date:  2024-09-04
hidden: true
excerpt: This is a test for dynamic routing with custom styles.
component: default
tags:
---

<!-- markdownlint-disable MD033 -->

<script>
  import CodeBlock from '$components/basic/CodeBlock.svelte'
  import Image from '$components/basic/Image.svelte'
  import GradientBg from '$components/GradientBg.svelte';
</script>

<GradientBg
  href="@images/clothesline.gif"
  light="rgba(0,0,0,0)"
  dark="rgba(0,0,0,0)"
/>

<CodeBlock lang="cpp">

```cpp
struct Xg {
  virtual ~Xg() = default;
  virtual Str GetName() { return "X"; }
};

template <typename T>
struct X : Xg {
  virtual ~X() = default;
  Str GetName() override { return typeid(*this).name(); }
};
```

</CodeBlock>
