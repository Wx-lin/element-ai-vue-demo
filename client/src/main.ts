import { createApp } from 'vue'
import ElementPlus from 'element-plus'
// @ts-ignore
import ElementAI from 'element-ai-vue'
import 'element-plus/dist/index.css'
import 'element-ai-vue/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(ElementAI)
app.mount('#app')
