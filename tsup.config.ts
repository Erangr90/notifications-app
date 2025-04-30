import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // entry point of your app
  outDir: "dist",
  target: "node16", // or your Node version
  format: ["cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true, // generates .d.ts files
});
