import graphql from "@rollup/plugin-graphql";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

// eslint-disable-next-line no-process-env
const isWatch = process.env.ROLLUP_WATCH;

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.mjs",
    format: "es",
  },
  plugins: [
    typescript({
      exclude: ["**/*.test.ts"],
    }),
    // nodeResolve(),
    // commonjs(),
    graphql(),
    // json(),
    ...(!isWatch ? [terser()] : []),
  ],
};
export default config;
