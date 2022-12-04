import pluginTypescript from "@rollup/plugin-typescript"

/** @type {import("rollup").RollupOptions} */
export default {
    input: "src/index.ts",
    output: {
        file: "dist/index.js",
        format: "esm",
    },
    plugins: [
        pluginTypescript(),
    ],
    external: (path) => {
        if (path.startsWith(".")) return false
        if (path.startsWith("/")) return false
        return true
    }
}