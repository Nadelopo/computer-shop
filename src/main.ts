import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createYmaps } from 'vue-yandex-maps'
import VWave from 'v-wave'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import FloatingVue from 'floating-vue'
import './utils/yup'
import type { PluginOptions } from 'vue-toastification'
import './assets/styles.sass'
import 'vue-toastification/dist/index.css'
import 'floating-vue/dist/style.css'

const app = createApp(App)

const options: PluginOptions = {
  timeout: 2000,
  newestOnTop: false,
  maxToasts: 10
}

app.use(createPinia())
app.use(router)
app.use(createYmaps({ apikey: import.meta.env.VITE_MAPS_KEY }))
app.use(VWave, {
  initialOpacity: 0.3
})
app.use(FloatingVue)
app.use(Toast, options)
app.mount('#app')
