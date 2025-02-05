import { defineConfig } from 'vite'

export default defineConfig({
  // ... existing config ...
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    open: true, // Automatically open browser
  }
}) 