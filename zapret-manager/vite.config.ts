import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import process from "node:process";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  clearScreen: false,

  envPrefix: ["VITE_", "TAURI_"],

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 0,
    // Отладочные вызовы не должны попадать в сборку, которую увидит
    // пользователь: они и размер добавляют, и подсказывают устройство кода.
    // `drop` работает только на этапе сборки — в разработке консоль остаётся.
    esbuild: {
      legalComments: "none",
      drop: process.env.TAURI_ENV_DEBUG ? [] : ["console", "debugger"],
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(
              id
            )
          ) {
            return "motion";
          }

          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          ) {
            return "react-vendor";
          }

          if (
            /[\\/]node_modules[\\/](zustand|use-sync-external-store)[\\/]/.test(
              id
            )
          ) {
            return "stores";
          }

          return undefined;
        },
      },
    },
  },
});
