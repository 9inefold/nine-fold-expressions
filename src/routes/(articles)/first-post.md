---
title: First blog post!
slug:  first-post
date:  2024-08-02
hidden: false
tags:
---

<!-- markdownlint-disable MD033 -->
<!-- invalid -->
<!-- test log on -->

Welcome to my blog! This is just a test post, real content coming soon...

```cpp
void welcome(const char* name = nullptr) {
  std::printf("Hello %s!", name ?: "world");
}
```

```ts
function welcome(name?: string) {
  console.log(`Hello ${name ?? 'world'}!`);
}
```

<!-- test log off -->

```hs
welcome :: Maybe String -> IO()
welcome x = case x of
  Just name -> print $ "Hello " ++ name ++ "!"
  Nothing   -> print "Hello world!"
```

<!-- test log -->

```rust
macro_rules! welcome {
  ($e: expr) => { print!("Hello {}!", $e) };
  () => { welcome!("world") };
}
```
