import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import { setTokenExpiredHandler } from './api/request'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Vant)

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
