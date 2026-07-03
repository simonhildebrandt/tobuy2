import * as esbuild from "esbuild";
import { wasmLoader } from "esbuild-plugin-wasm";

const settings = {
  entryPoints: ["src/index.jsx"],
  bundle: true,
  outfile: "dev/index.js",
  plugins: [wasmLoader()],
  format: "esm",
  jsx: "automatic",
  define: {
    API_HOST: JSON.stringify(process.env.API_HOST || "ws://localhost:8787"), // "wss://tobuy2-sync.simonhildebrandt.workers.dev" "wss://tobuy2.fly.dev/"
  },
};

if (process.env.WATCH == "1") {
  const ctx = await esbuild.context(settings);
  ctx.watch();
} else {
  await esbuild.build(settings);
}
