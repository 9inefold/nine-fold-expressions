---
title: Dynamic blog post!
date:  2024-08-04
hidden: true
component: empty
tags:
  - x
  - y
  - $hc
---

<!-- markdownlint-disable MD033 -->

<script>
  import CodeBlock from '$components/basic/CodeBlock.svelte';
</script>

**Hello** from a *"dynamic"* route...

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
