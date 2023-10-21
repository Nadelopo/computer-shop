import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VWave from 'v-wave'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import type { PluginOptions } from 'vue-toastification'
import './assets/index.sass'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

const options: PluginOptions = {
  timeout: 2000,
  newestOnTop: false,
  maxToasts: 10
}

app.use(createPinia())
app.use(router)
app.use(VWave, {
  initialOpacity: 0.3
})
app.use(Toast, options)
app.mount('#app')
