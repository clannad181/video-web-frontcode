import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './style.css'
import { loadSettings, applyAllSettings } from './utils/theme'
import { setTokenExpiredHandler } from './api/request'
import { useAuthStore } from './stores/auth'

const savedSettings = loadSettings()
applyAllSettings(savedSettings)

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, { zIndex: 4000, locale: zhCn })

// 在 pinia 挂载后注册 token 过期处理器
const authStore = useAuthStore()
setTokenExpiredHandler(() => {
  authStore.logout()
  // 只有在需要登录的页面才跳转登录页
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push('/login')
  }
})

app.mount('#app')
