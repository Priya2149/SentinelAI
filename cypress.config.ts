import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});