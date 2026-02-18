import { defineConfig } from "vitest/config";
import { vitestSetupFilePath } from "@hirosystems/clarinet-sdk/vitest";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "clarinet",
    singleThread: true,
    globals: true,
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        manifest: resolve(__dirname, "./Clarinet.toml"),
        coverage: false,
        costs: false,
      },
    },
  },
});
