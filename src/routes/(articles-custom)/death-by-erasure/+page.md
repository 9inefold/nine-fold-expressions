---
title: Death by Type Erasure
date: 2024-09-10
updated: 2024-09-13
hidden: false
excerpt: Join me as I rant about generics and take a peek behind the curtains.
component: default
tags:
  - dirty-laundry
  - metaprogramming
  - type-systems
  - c#
---

<!-- markdownlint-disable MD033 -->
<!-- modcode map-permissive on -->

<script>
  import Image from '$components/basic/Image.svelte'
  import GradientBg from '$components/GradientBg.svelte';
</script>

<GradientBg
  href="@images/clothesline.gif"
  light="rgba(0,0,0,0)"
  dark="rgba(0,0,0,0)"
  opacity={10}
  slideSpeed={{x:17,y:20}}
/>

## Overview

- [Overview](#overview)
- [Intro](#intro)
- [Background](#background)
  - [Volatile in C/C++](#volatile-in-cc)
  - [Volatile in C#](#volatile-in-c)
- [Fiddly generics](#fiddly-generics)
- [Death by erasure](#death-by-erasure)
  - [Heterogeneous generics](#heterogeneous-generics)
  - [Homogenous generics](#homogenous-generics)
  - [What about C#?](#what-about-c)
- [A low-level translation](#a-low-level-translation)
- [Get to the point](#get-to-the-point)
- [Dynamic dispatch](#dynamic-dispatch)
- [Conclusion](#conclusion)

## Intro

Template metaprogramming is by far my favorite part of C++, buuut it sets a
pretty high bar for other language's generics. There are lots of ways to
implement them, so whenever I look into a language, I check out the facilities.
My most recent investigation into C# was no different.

Now, I knew going in that C# was similar to Java, but being part of the
"C family" I made some... incorrect assumptions
(which I'll get to [later](#death-by-erasure)).

## Background

It started with me prodding variable lifetimes in the GC.
I had a function like so:

```cs
private static void Tester(string name) {
  Finalizer obj = new() { .\.\. };
}
```

Which I was using to test when exactly a finalizer would get called:

```cs
public class Finalizer {
  public static bool Wait = true;
  .\.\.
  ~Finalizer() {
    .\.\.
    Wait = false;
  }
}
```

But then I wanted to add settings I could toggle via the command line while
still running a loop. That led to me adding a ``Task``
for non-blocking (asynchronous) console input.

The issue came about while making sure the compiler wouldn't optimize out my loop
condition checks. So I went with the dreaded ``volatile``...

...and was pleasantly surprised, no tactical UB required!
The purpose of ``volatile`` often confuses people, so let me quickly explain it.

### Volatile in C/C++

In C/C++ ``volatile`` is specifically for things like memory-mapped IO.

For example, let's say I'm interfacing with an LED,
and it has a serial port bound to the address ``ADDR``.
Every time a value is written, it sends a signal to the device to flash a color for a second.

Let's say we've told the compiler to put the variable ``g_port`` at ``ADDR``.
We can then try interface with it from C:

<!-- 
modcode map
RED  token label;
BLUE token label;
-->
```c
// In assembly we say this value is at ADDR.
extern int g_port;

enum LEDColors {
  RED   = 1,
  BLUE  = 2,
  ...
};

void flash_thrice(void) {
  // Each write queues up a flash.
  g_port = RED;
  g_port = BLUE;
  g_port = RED;
}
```

The issue is, from the compiler's view the first two writes in ``flash_thrice`` can
be removed, as they have no visible *side effects* (or changes to the program's state).
This means the incorrect code is generated and the LED only flashes once:

<!-- 
modcode map
ptr   token keyword;
dword token keyword;
mov   token function;
ret   token function;
g_port token variable;
-->
```x86asm
flash_thrice:
  ; First 2 writes removed by the compiler
  mov dword ptr [g_port], 1
  ret
```

But if we make ``g_port`` ``volatile``, the compiler has to assume these writes
have side effects ([C11 §5.1.2.3.2](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf#page=32)),
and generates the correct code:

<!-- 
modcode map
ptr   token keyword;
dword token keyword;
mov   token function;
ret   token function;
g_port token variable;
-->
```x86asm
flash_thrice:
  mov dword ptr [g_port], 1
  mov dword ptr [g_port], 2
  mov dword ptr [g_port], 1
  ret
```

And now our LED flashes correctly!
For more detail, read [this article](https://bajamircea.github.io/coding/cpp/2019/11/05/cpp11-volatile.html).

### Volatile in C\#

Unlike C++ where ``volatile`` just restricts certain load/store optimizations
without saying [anything specific](https://eel.is/c++draft/dcl.type.cv#6),
C# ``volatile`` is required to be [acquire/release](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/classes#1554-volatile-fields).

A nice choice for sure, as it helps avoid *some* of the issues that trip up a lot of C++ beginners
(though it's important to note C# ``volatile`` is still not magical,
read more [here](https://ericlippert.com/2011/06/16/atomicity-volatility-and-immutability-are-different-part-three/)).

So... easy fix?

```cs
public class Finalizer {
  public static volatile bool Wait = true;
  .\.\.
}
```

Well... yeah. But that led to my first false assumption,
which I immediately noticed when trying to make a local variable:

```cs
volatile bool runInLoop = false; // Error CS0106
```

Just because ``volatile`` can be applied *here* doesn't mean it can *everywhere*.

Well crap. It has weird semantics. What to do now?
Maybe something sensible like the Interlocked ``.Exchange``/``.Read``...?

Ha! No, of course not! It's time to see how well this language bends...

## Fiddly generics

As you can tell by the section header, not very well.

My "genius" idea was to implement a volatile wrapper, the first attempt being:

```cs
namespace Evil;

public struct Volatile<T> {
  public volatile T Value; // Error CS0677
}
```

This doesn't work for reasons that would become obvious to me [later](#death-by-erasure).
But at the time I decided to just ignore it and power through.

Looking at the allowed uses, you can declare the following ``volatile``:

- ``[s]byte``, ``[u]short``, ``[u]int``, ``char``, ``float``, ``bool``
- Enums based on any of the former
- Reference types (``class``es)

Ok, so instead of doing things directly in ``Volatile``, lets make it an interface
and use a factory to create specific instances:

```cs
namespace Evil;

public interface Volatile<T> {
  public void Set(T value);
  public T Get();
}

public static class VolatileFactory;

public class VolatileRef<T> : Volatile<T> where T: class {
  .\.\.
  private volatile T Value;
}
```

Hmmm... well there's a lot of types to write this code for.
Instead of doing it by hand, let's write a little code generator.
We'll make it take a ``(NAME, TYPE)`` tuple and output:

```cs
public class VolatileNAME : Volatile<TYPE> {
  public VolatileNAME() { }
  public VolatileNAME(TYPE value) => Value = value;
  public TYPE Get() => Value;
  public void Set(TYPE value) => Value = value;
  public volatile TYPE Value = default;
}
```

Now we have all the value types implemented, we just have to generate the factory methods.
I decided to go with a C++ style type wrapper dispatch method,
because surely that works in any language with overloading!

```cs
public struct TypeRef<T> { }

// For each (NAME, TYPE):
public static partial class VolatileFactory {
  public static Volatile<TYPE> Make(TYPE value) {
    return new VolatileNAME(value);
  }
  private static Volatile<TYPE> Make(TypeRef<TYPE> _) {
    return new VolatileNAME();
  }
}

.\.\.

// And then:
public static partial class VolatileFactory {
  public static Volatile<T> Make<T>() {
    return Make(new TypeRef<T>()); // :(
  }
  // Always matches:
  private static Volatile<T> Make<T>(TypeRef<T> _) {
    throw new ArgumentException(
      $"Invalid type 'Volatile<{typeof(T).Name}>'");
  }
}
```

But to my dismay, it did not.
Instead I got ``cannot convert from 'Evil.TypeRef<T>' to 'char'``! Why?

## Death by erasure

The issue was my second assumption, being about how C# generics actually work.
Even though I understood they were very different from C++ templates,
I didn't realize exactly why until this point.

In this context, **C# uses homogeneous generics.** Ugh.

To those wondering what this means, it's actually pretty simple...
but I'm gonna overexplain it because this is **my** blog dammit!
(or skip [here](#what-about-c) if you don't care).

Lets first make a "cross-language" example:

<!-- modcode NOLANG --->
<!-- 
modcode map
generic token keyword;
-->
```rust
generic <T> struct X {
  pub value: T;
  pub fn cmp(T in) -> bool {
    return (value == in);
  }
}
```

There are two main languages on each end of the spectrum: C++ and Java.
We will be creating ``X<int>`` and ``X<String>`` for both,
and seeing what happens under the hood.

### Heterogeneous generics

C++ uses heterogenous generics, which means every instantiation of a template is unique.
Translating our example, we get:

<!-- 
modcode map
String token keyword;
T token class-name;
-->
```cpp
using String = std::string;

template <typename T> struct X {
  T value;
  bool cmp(T in) {
    return (value == in);
  }
};
```

When I create our classes, the compiler generates something like:

<!-- 
modcode map
String token keyword;
-->
```cpp
struct X<int> {
  int value;
  inline bool cmp(int in) {
    return (value == in);
  }
};

struct X<String> {
  String value;
  inline bool cmp(String in) {
    return operator==(value, in);
  }
};
```

And this the reason you can do specialization.

But it also means the template doesn't actually exist in the binary.
You can preparse them via modules,
but there's no (standard) way to precompile them generically.

All you can do is:

<!-- 
modcode map
X token class-name;
MyType token class-name;
-->
<!-- modcode map-ignore comment -->
```cpp
// In `MyType.hpp`
extern template struct X<MyType>;
// In `MyType.cpp`
template struct X<MyType>;
```

Which tells the compiler the instance already exists.

### Homogenous generics

Java is almost the exact opposite; with homogeneous generics, every instance is the same.
Translating our example, we get:

```java
class X<T> {
  public T value;
  public boolean cmp(T in) {
    return value.equals(in);
  }
}
```

And no matter what classes I instance
(though it should be noted ``int`` cannot be used directly as it is a primitive type,
you have to box it via ``Integer``), the compiler generates:

```java
class X {
  public Object value;
  public boolean cmp(Object in) {
    return value.equals(in);
  }
}
```

This was done to allow the (at the time) newly-implemented generics to still work
with the old ``.class`` files (thanks ABI!).

One of the benefits of homogeneous generics is that they can be compiled once and used
the same way for everything. This can dramatically speed up compile times
at the cost of performance and safety.

For example, a major footgun is:

```java
X<String> x = new X<>();
X raw = x;      // Now untyped
raw.value = 55;
String s = x.value;
```

Which gives us a beautiful [ClassCastException](https://godbolt.org/z/cbonbz4M5).

### What about C#?

C# sits between these two implementations, technically only being *partially* homogenous.
Like Java, a single generic class is created in [CIL](https://en.wikipedia.org/wiki/Common_Intermediate_Language),
checking the validity of the class given the type's constraints;
but unlike Java, the C# runtime knows what generics are,
and they can be reified (though unlike C++ this is at JIT time).

Reification is great for many reasons, one being performance,
as it allows for specialized instantiations of primitive types.
For example, instead of storing an array of ``int``s boxed into ``Object``s,
one can directly store the array of ``int``s.

It also allows you to reflect on the exact type of a generic object,
as well as the use of static objects/methods.

Let's skip straight to instantiating our objects:

<!-- 
modcode map
T token class-name
-->
```csharp
struct X`1<T> {
  public !T value;
  // Changed to "_in" as "in" is a keyword.
  public bool cmp(!T _in) {
    return value.Equals(_in);
  }
}
```

The `` `1`` is important. It corresponds to the arity of a class,
allowing you to "overload" generics in the same namespace.

``!T`` signifies the use of the class scope generic type ``T``,
while ``!!T`` (not shown) means method scope
(this allows for binary-level shadowing).

This is the actual representation of ``X`` in the binary,
the specialization will not exist until the program first runs.
If we run the program, we may get something like this
(though less annotated than real objects):

<!-- 
modcode map
X`1     token class-name;
Int32   token class-name;
__Canon token class-name;
-->
```csharp
using System;

struct X`1[Int32] {
  public Int32 value;
  public bool cmp(Int32 _in) {
    return value == _in;
  }
}

struct X`1[__Canon] {
  public __Canon value;
  public bool cmp(__Canon _in) {
    return value.Equals(_in);
  }
}
```

What? Where did this ``__Canon`` type come from?

Well, it's shorthand for "canonical" (meaning standard, referencing object layout),
and is an internal type acting as a placeholder for all reference (``class``) types.

This is a direct way to force code sharing, which decreases the binary footprint;
if a generic's arguments are all reference types,
they will all be ``__Canon``, and therefore use the same functions
(for more detail, read [this](https://alexandrnikitin.github.io/blog/dotnet-generics-under-the-hood)).

This extends to the use of static objects,
which work by implicitly passing a pointer to the object's method table,
which can then be used generically.

Other languages have tried different methods to get this to work AOT,
though with some drawbacks.

Scala added the [``@specialized``](https://www.baeldung.com/scala/specialized-annotation)
annotation, which can be used to flatten primitive generics.
The only issue is you either have to instantiate *every* primitive type,
massively increasing the binary size, or manually list the desired types.

Kotlin has the [``reified``](https://kotlinlang.org/docs/inline-functions.html#reified-type-parameters)
keyword, which allows you to directly interact with a type as if it was not generic.
The only drawback is it can only be used with ``inline`` functions,
which, like ``@specialized``, increases the binary size.

## A low-level translation

Let's go on a quick tangent, starting by defining a new generic, ``Y``:

```csharp
class Y<T> {
  public required T Value { get; set; }
  private static int Count = 0;
  public static int Inc() => Count++;
}
```

This will be desugared into something like:

<!-- 
modcode map
T token class-name;
Value$__storage token regex;
-->
```csharp
class Y<T> {
  private T Value$__storage;
  private static int Count; // Defaults to 0

  public T Value {
    get {
      return Value$__storage;
    }
    set {
      Value$__storage = value;
    }
  }

  public static int Inc() {
    return Count++;
  }
}
```

Assuming value types are equivalent to fundamental/trivial types,
the rough C++ translation is something like so:

<!-- 
modcode map
ALWAYS_INLINE token label;
T       token class-name;
Y$      token class-name;
__Canon token class-name;
TypeKey token class-name;
Map     token class-name;

Value$__storage token regex;
Count$__data    token regex;
Count           token regex;
-->
```cpp
struct Y$ {
private:
  __Canon Value$__storage;
  static inline Map<TypeKey, struct Data*> Count$__data;
public:
  static int Y$::Inc(TypeKey Key) noexcept {
    auto* data = Count$__data.at(Key);
    return data->Count++;
  }
};

template <typename T>
struct Y : Y$ {
  ALWAYS_INLINE T& Value() {
    return *Y$::Value$__storage.As<T>();
  }
  ALWAYS_INLINE static int Inc() {
    return Y$::Inc(id_ptr<T>());
  }
};

template <typename T>
requires standard_layout<T>
struct Y<T> {
private:
  static inline int Count = 0;
  T Value$__storage;
public:
  T& Value() { return Value$__storage; }
  static int Inc() { return Count++; }
};
```

For some example usage, let's convert the following:

<!-- 
modcode map
Y token class-name;
-->
```csharp
Y<int> i = new() { Value = 55 };
Y<string> s = new() { Value = "Yello" };

Y<int>.Inc();
Y<string>.Inc();

if (Y<int>.Inc() == 1) {
  Console.WriteLine($"{i.Value}, {s.Value}");
}
```

Which leaves us with:

<!-- 
modcode map
Y token class-name;
String token keyword;
-->
<!-- modcode map-ignore comment -->
```cpp
Y<int>* i = New();
i->Value() = 55;

Y<String>* s = New();
s->Value() = "Yello";

i->Inc();
s->Inc(); // id_ptr<String>() inlined.

if (i->Inc() == 1) {
  std::cout << i->Value()
    << ", " << s->Value() << '\n';
}
```

And of course, it's more complicated than this,
and I left [some parts out](https://godbolt.org/z/Ex7x8PvKn),
but you get the general idea.

## Get to the point

Alright, so the issue was I was thinking I was dealing with one technique,
when really I was dealing with the opposite.
While C# has stricter rules when it comes to generics
(eg. you can't create a raw ``X`` like in Java), it still uses a similar system.

Since generics are reified at runtime, the compiler can't just check
if a specific instantiation is valid.
Instead, it acts in a similar way to Java wildcards,
ensuring *all* types are valid for a generic instantiation.

Even though directly passing a ``TypeRef<>`` from a
non-generic context *would* call the overloads,
because the function has to define a single CIL signature,
it doesn't in our generic case.

So... is my method impossible in C#?
Will I have to manually dispatch these types??

Weeeell... no :)

## Dynamic dispatch

C# has a fun keyword called ``dynamic``,
which allows you to move certain checks from compile time to runtime.

By changing my code from earlier to:

```csharp
// For each (NAME, TYPE):
public static partial class VolatileFactory {
  private static Volatile<TYPE> MakeTy(TypeRef<TYPE> _) {
    return new VolatileNAME();
  }
  ...
}

public static partial class VolatileFactory {
  public static Volatile<T> Make<T>() {
    dynamic ty = default(TypeRef<T>);
    return MakeTy(ty);
  }
  ...
}
```

I get exactly the result I was looking for.
It actually selects the specific overloads instead of just defaulting to
the generic one.

But how does this actually work?

Well, here's the desugared code (with some not-so-legal tweaks for readability):

<!-- 
modcode map
T         token class-name;
X         token class-name;
ConvType  token class-name;
DispType  token class-name;
Func      token class-name;
CallSite  token class-name;
Binder    token class-name;
DynBinder token class-name;

CSharpBinderFlags   token class-name;
Create              token function;
UseCompileTimeType  token number;
IsStaticType        token number;
None                token number;
-->
```csharp
using Microsoft.CSharp.RuntimeBinder;
using System.Runtime.CompilerServices;

using DispType = Func<CallSite, Type, object, object>;
using ConvType<T> = Func<CallSite, object, X<T>>;

public static partial class VolatileFactory {
  private static class DynBinder<T> {
    public static CallSite<DispType>    Disp;
    public static CallSite<ConvType<T>> Conv;
  }

  public static X<T> Make<T>() {
    object arg = default(TypeRef<T>);
    // Shorthand
    ref var Disp = ref DynBinder<T>.Disp;
    ref var Conv = ref DynBinder<T>.Conv;
    // Current context
    Type typeFromHandle = typeof(XFactory);

    if (Conv == null) {
      Conv = CallSite<ConvType<T>>.Create(
        Binder.Convert(
          CSharpBinderFlags.None, 
          typeof(X<T>), typeFromHandle)
      );
    }
  
    if (Disp == null) {
      using CSharpArgumentInfoFlags;
      CSharpArgumentInfo[] array = [
        CSharpArgumentInfo.Create(
          UseCompileTimeType | IsStaticType, null),
        CSharpArgumentInfo.Create(None, null)
      ];

      Disp = CallSite<DispType>.Create(
        Binder.InvokeMember(
          CSharpBinderFlags.None, "MakeTy",
          null, typeFromHandle, array)
      );
    }

    // @bind is not a real method.
    var invoke  = @bind(Disp, Target);
    var convert = @bind(Conv, Target);
    return convert(
      invoke(typeFromHandle, arg));
  }
}
```

But what does this all do?

First, we have to initialize the ``CallSite`` delegates;
this only happens the first time the function is run.
``Conv`` is a type conversion binder, ``Disp`` is a member invocation binder.

``Conv`` just takes an ``object`` and attempts to unbox it as ``X<T>``.
``Disp`` is a little more complex:

1. We supply the function name and, if applicable, type arguments.
Since our function has no indeducible type arguments, we pass the latter as ``null``.
1. We pass the function calling context.
This tells the runtime where to search for the function of the given name.
1. We define the arguments.
The first element of the array is the static type of the function.
This is [always discarded](https://github.com/microsoft/referencesource/blob/51cf785/Microsoft.CSharp/Microsoft/CSharp/CSharpInvokeMemberBinder.cs#L52C31-L52C63) to maintain compatibility with methods.
The second element is the actual argument of our function.

Both binders are then converted to ``CallSite``s,
which wrap a success and failure case.
These may be wrapped via ``Reflection.MethodInfo.CreateDelegate`` in the simple case
(eg. lambda IL compilation is enabled, ``T`` is generic,
and the function has no ``ref`` parameters),
but is otherwise manually compiled to IL via
[``CreateCustomUpdateDelegate``](https://github.com/dotnet/runtime/blob/43f22c651184fe63935f5e509ab060d099d55f9d/src/libraries/System.Linq.Expressions/src/System/Runtime/CompilerServices/CallSite.cs#L360) and
[``CreateCustomNoMatchDelegate``](https://github.com/dotnet/runtime/blob/43f22c651184fe63935f5e509ab060d099d55f9d/src/libraries/System.Linq.Expressions/src/System/Runtime/CompilerServices/CallSite.cs#L669).

Once the delegates have been created,
I wrap them using the pseudofunction ``@bind``,
which would look something like this:

<!-- modcode NOLANG -->
<!-- modcode map-permissive -->
```rust
macro_rules! bind {
  ($obj:ident, $func:ident) => {
      Box::new(|arg| $obj.$func(&$obj, arg))
  }
}
```

We can then finally invoke ``Disp.Target``
with the current context, and unbox the result with ``Conv.Target``.

## Conclusion

When I first started writing this I was pretty annoyed with the system,
but the more I looked into it, the more I started to like it.

That's not to say I'll be switching to C# for my personal projects anytime soon,
but I did end up appreciating the design of the language and its runtime.
The designers made some great choices (ESPECIALLY when compared to Java),
and you can really see the care that went into it.

Anyways, first blog article finally done.
Lemme know if you actually made it to the end :P

<Image href="images/waving-thing.gif" alt="Bye bye!" />
