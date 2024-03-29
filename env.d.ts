/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import 'vue-router'
export {}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    admin?: boolean
  }
}
