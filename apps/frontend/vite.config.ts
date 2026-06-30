import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@atlas/api': resolve(__dirname, '../../packages/atlas-api/src'),
      '@atlas/auth': resolve(__dirname, '../../packages/atlas-auth/src'),
      '@atlas/events': resolve(__dirname, '../../packages/atlas-events/src'),
      '@atlas/plugin-sdk': resolve(__dirname, '../../packages/atlas-plugin-sdk/src'),
      '@atlas/ui': resolve(__dirname, '../../packages/atlas-ui/src'),
      '@atlas/utils': resolve(__dirname, '../../packages/atlas-utils/src'),
    },
  },
})
