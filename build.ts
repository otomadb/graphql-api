import * as esbuild from "esbuild";

const isWatch = process.argv[2] === "watch";

if (isWatch) {
  const ctx = await esbuild.context({
    logLevel: "info",
    bundle: true,
    entryPoints: ["./src/index.ts"],
    outdir: "./dist",
    outExtension: { ".js": ".mjs" },
    platform: "node",
    format: "esm",
    loader: {
      ".graphql": "text",
    },
    banner: {
      js: `
      const require = (await import("node:module")).createRequire(import.meta.url);
      const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
      const __dirname = (await import("node:path")).dirname(__filename);
    `,
    },
  });
  await ctx.watch();
} else {
  await esbuild.build({
    logLevel: "info",
    bundle: true,
    entryPoints: ["./src/index.ts"],
    outdir: "./dist",
    outExtension: { ".js": ".mjs" },
    platform: "node",
    format: "esm",
    loader: {
      ".graphql": "text",
    },
    banner: {
      js: `
    const require = (await import("node:module")).createRequire(import.meta.url);
    const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
    const __dirname = (await import("node:path")).dirname(__filename);
  `,
    },
  });
}
