# Nine Fold Expressions

A blog of sorts...
Made this mostly from scratch, all the components are at least.

## Rehype plugins

My custom plugins are in [packages](/packages).
There were no good examples on using rehype with my setup so I kinda freeballed it.

To extend them, you have to add to [``scripts.build-mono``](/package.json)
(they don't automatically get built).
You also need to make a [reference](/tsconfig.json) to the path.

Make sure you run ``pnpm run build`` to compile the plugins.
