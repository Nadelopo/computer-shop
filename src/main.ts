import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VWave from 'v-wave'
import App from './App.vue'
import router from './router'
import './styles/index.sass'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VWave, {
  initialOpacity: 0.3
})
app.mount('#app')
