/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

import 'vue-router'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

export {}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    admin?: boolean
  }
}
