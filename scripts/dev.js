#!/usr/bin/env node

/**
 * Custom dev server script that shows multi-tenant URLs
 */

const { spawn } = require('child_process');

const PORT = 4444;

const TENANT_URLS = `
   🍽️  Waiter Agent - AI Restaurant Assistant
   ────────────────────────────────────────
   - Local:         http://localhost:${PORT}
   - Pista House:   http://pistahouse.waiter.local:${PORT}
   - Chutneys:      http://chutneys.waiter.local:${PORT}
   ────────────────────────────────────────
   - Chat:          http://localhost:${PORT}/agent
   - Admin:         http://localhost:${PORT}/admin
`;

// Start Next.js dev server
const next = spawn('npx', ['next', 'dev', '--port', PORT.toString()], {
  stdio: 'inherit',
  shell: true
});

// Show tenant URLs after a short delay (wait for Next.js to start)
setTimeout(() => {
  console.log(TENANT_URLS);
}, 3000);

next.on('close', (code) => {
  process.exit(code);
});
