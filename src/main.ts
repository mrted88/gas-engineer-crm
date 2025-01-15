import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './assets/styles/global.css'
import '@fortawesome/fontawesome-free/css/all.css'

// Create Vue app
const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 50,
  delay: 100,
  easing: 'ease-in-out'
})

// Use plugins
app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// Mount app
app.mount('#app')