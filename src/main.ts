import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VWave from 'v-wave'
import Toast from 'vue-toastification'
import FloatingVue from 'floating-vue'
import type { PluginOptions } from 'vue-toastification'
import App from './App.vue'
import router from './router'
import './utils/yup'
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
app.use(VWave, {
  initialOpacity: 0.3
})
app.use(FloatingVue)
app.use(Toast, options)
app.mount('#app')
