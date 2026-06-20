import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['tests/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ttg/game-core': path.resolve(__dirname, './packages/game-core/src'),
      '@ttg/game-physics': path.resolve(__dirname, './packages/game-physics'),
    },
  },
})
