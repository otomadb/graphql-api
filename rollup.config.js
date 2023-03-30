import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import graphql from "@rollup/plugin-graphql";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [
    graphql(),
    typescript({
      exclude: ["**/*.test.ts"],
    }),
    terser(),
  ],
};
export default config;
