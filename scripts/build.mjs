import * as esbuild from "esbuild";
import { wasmLoader } from "esbuild-plugin-wasm";

const ctx = await esbuild.context({
  entryPoints: ["src/index.jsx"],
  bundle: true,
  outfile: "dev/index.js",
  plugins: [wasmLoader()],
  format: "esm",
  jsx: "automatic",
});

ctx.watch();
