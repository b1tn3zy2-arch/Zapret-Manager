import path from "node:path";
import process from "node:process";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary"],
      include: ["src/lib/**", "src/stores/**"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/mocks/**",
        "src/lib/*Commands.ts",
        "src/lib/resources.ts",
        "src/lib/secureInvoke.ts",
        "src/lib/storage.ts",
        "src/lib/systemInfo.ts",
        "src/lib/trayActions.ts",
      ],
      thresholds: {
        lines: 65,
        functions: 60,
        branches: 55,
        statements: 65,
      },
    },
  },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  mode: process.env.NODE_ENV === "test" ? "test" : "development",
});
