import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'src/main/index.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['better-sqlite3', 'electron-store', 'sql.js']
            }
          }
        }
      },
      {
        entry: 'src/preload/index.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload'
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  build: {
    outDir: 'dist'
  }
})
