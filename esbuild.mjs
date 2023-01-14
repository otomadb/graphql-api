import * as esbuild from "esbuild";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

// https://github.com/evanw/esbuild/issues/1051
const nativeModules = {
  name: "native-node-modules",
  setup(build) {
    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader[".node"] = "file";
  },
};

await esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: "output/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  plugins: [commonjs()],
});
