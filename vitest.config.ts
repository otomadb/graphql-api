import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...defaultExclude, "**/.direnv/**"],
    threads: false,
    setupFiles: ["./test/setup.ts"],
  },
});
