import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { epConfig } from '@/utils/ep-config'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './locales'
import App from './App.vue'
import './styles/index.scss'
import vue3videoPlay from 'vue3-video-play'
import 'vue3-video-play/dist/style.css'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 传响应式配置，语言切换时 Element Plus 组件文案才会跟着变
app.use(ElementPlus, epConfig)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vue3videoPlay)

app.mount('#app')
