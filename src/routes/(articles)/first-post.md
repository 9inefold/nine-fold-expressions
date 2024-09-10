---
title: First blog post!
slug:  first-post
date:  2024-08-02
hidden: false
tags:
---

<!-- markdownlint-disable MD033 -->

<script>
  import CodeBlock from '$components/basic/CodeBlock.svelte'
</script>

Welcome to my blog! This is just a test post, real content coming soon...

<CodeBlock lang="cpp">

```cpp
void welcome(const char* name = "world") {
  std::printf("Hello %s!", name ?: "world");
}
```

</CodeBlock>
