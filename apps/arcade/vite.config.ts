import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@offline-arcade/game-catalog": fileURLToPath(
        new URL("../../packages/game-catalog/src/index.ts", import.meta.url)
      ),
      "@offline-arcade/webgpu-kit": fileURLToPath(
        new URL("../../packages/webgpu-kit/src/index.ts", import.meta.url)
      )
    }
  }
});
