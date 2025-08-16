Bun.build({
    entrypoints: ["src/index.ts"],
    target: "node",
    banner: "#!/usr/bin/env node",
    minify: true,
    outdir: "dist"
})
