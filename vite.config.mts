import { checker } from 'vite-plugin-checker'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// @ts-ignorej
// import { routes } from './src/router'

function consolePlugin(q: any = 2) {
  return {
    name: 'vite-plugin-console',

    buildStart() {
      console.log(1, q)
    }
  }
}

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
    vueDevTools(),
    consolePlugin()
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
