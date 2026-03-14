import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/megaeth-audit": "bin/megaeth-audit.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  shims: true,
});
