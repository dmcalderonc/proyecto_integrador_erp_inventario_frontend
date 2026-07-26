import { defineConfig } from 'cypress';

const frontendUrl = 'http://localhost:5173';
const apiUrl = process.env.VITE_API_URL || 'https://calderon-erp.uaeftt-ute.site';


export default defineConfig({
  e2e: {
    baseUrl: frontendUrl,
    env: {
      apiUrl,
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    allowCypressEnv: false,
  },
});