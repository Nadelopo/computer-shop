/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

import 'vue-router'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    admin?: boolean
  }
}
