import { checker } from 'vite-plugin-checker'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,vue}"'
      },
      overlay: {
        initialIsOpen: false
      }
    }),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000
  }
})
