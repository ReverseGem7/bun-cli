import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: "src/index.ts",
    dts: {
        sourcemap: true,
    },
    format: ['cjs', 'esm'],
    outExtensions: (ctx) => ({
        dts: ctx.format === 'cjs' ? '.d.cts' : '.d.mts',
        js: ctx.format === 'cjs' ? '.cjs' : '.mjs',
    }),
})
