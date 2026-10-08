import { defineConfig, devices } from "@playwright/test";

const PORT = 1420;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 2 : 0,
  workers: process.env.CI !== undefined ? 1 : undefined,
  reporter: process.env.CI !== undefined ? "line" : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: process.env.CI === undefined,
    timeout: 120_000,
  },
});
