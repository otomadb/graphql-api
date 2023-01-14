import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: "esm",
  clean: !options.watch,
  minify: !options.watch,
}));
