import commonjs from "@rollup/plugin-commonjs";
import graphql from "@rollup/plugin-graphql";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

// eslint-disable-next-line no-process-env
const isWatch = process.env.ROLLUP_WATCH;

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.cjs",
    format: "commonjs",
  },
  plugins: [
    typescript({
      exclude: ["**/*.test.ts"],
    }),
    nodeResolve(),
    commonjs(),
    graphql(),
    json(),
    ...(!isWatch ? [terser()] : []),
  ],
};
export default config;
