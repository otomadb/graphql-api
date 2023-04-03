import graphql from "@rollup/plugin-graphql";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [graphql()],
  test: {
    include: ["src/**/*.test.{js,ts}"],
    exclude: [...defaultExclude],
    threads: false,
    globalSetup: ["./test/globalSetup.ts"],
  },
});
