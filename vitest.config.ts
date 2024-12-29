/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import type { UserConfigExport, Plugin } from 'vitest/config'

const vuePlugin = vue as unknown as () => Plugin

const config: UserConfigExport = {
  plugins: [vuePlugin()],
  test: {
    environment: 'jsdom',
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}

export default defineConfig(config)
