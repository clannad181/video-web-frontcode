/**
 * Axios 请求封装
 * 功能：
 * 1. 自动添加Authorization请求头
 * 2. 请求/响应拦截器
 * 3. Token刷新机制（带队列管理）
 * 4. 错误处理
 * 5. 进度条显示（支持并发）
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import i18n from '@/locales'
import { getToken, getRefreshToken, setAuth, clearAuth } from './auth'
import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置NProgress
NProgress.configure({ showSpinner: false })

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 是否正在刷新token
let isRefreshing = false
// 失败队列（等待token刷新的请求）
let failedQueue = []

// 请求并发计数器
let requestCount = 0

/**
 * 增加请求计数并开始进度条
 */
function startRequest() {
  requestCount++
  NProgress.start()
}

/**
 * 减少请求计数，当没有请求时结束进度条
 */
function endRequest() {
  requestCount = Math.max(0, requestCount - 1)
  if (requestCount === 0) {
    NProgress.done()
  }
}

/**
 * 处理失败队列
 * @param {Error|null} error - 错误对象（null表示刷新成功）
 * @param {String|null} token - 新的token（刷新成功时提供）
 */
function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 是否正在登出（防止并发重复跳转）
let isLoggingOut = false

/**
 * 强制登出（使用路由跳转，防止并发重复跳转）
 */
function forceLogout() {
  if (isLoggingOut) return
  isLoggingOut = true
  clearAuth()
  router.push('/login').finally(() => {
    isLoggingOut = false
  })
}

/**
 * 刷新Token
 * @returns {Promise<{accessToken: string, refreshToken: string}>} 新的token对
 */
async function refreshAccessToken() {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/user/refresh`,
    { headers: { 'refresh-token': refreshTokenValue } }
  )
  if (res.data.code === 200) {
    return res.data.data
  }
  throw new Error(res.data.message || 'Refresh token failed')
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    startRequest()
    // 自动添加Authorization请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    endRequest()
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  async response => {
    endRequest()
    const res = response.data
    // 请求成功
    if (res.code === 200) {
      return res
    }
    // Token过期（业务码401）
    if (res.code === 401) {
      const originalRequest = response.config
      if (originalRequest._retry) {
        forceLogout()
        return Promise.reject(new Error('Token refresh failed'))
      }
      // 如果正在刷新token，将请求加入队列
      if (isRefreshing) {
        originalRequest._retry = true
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return service(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      // 尝试刷新token
      let tokenPair
      try {
        tokenPair = await refreshAccessToken()
      } catch (e) {
        processQueue(e, null)
        isRefreshing = false
        forceLogout()
        return Promise.reject(e)
      }
      // 刷新成功，处理队列并重试原请求
      const { accessToken, refreshToken: newRefreshToken } = tokenPair
      setAuth(accessToken, newRefreshToken)
      processQueue(null, accessToken)
      isRefreshing = false
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
      return service(originalRequest)
    }
    // 无权限（403）- 直接提示，不尝试刷新token
    if (res.code === 403) {
      ElMessage.error(i18n.global.t('无权限访问'))
      return Promise.reject(new Error(res.message || i18n.global.t('无权限')))
    }
    // 其他业务错误
    return Promise.reject(new Error(res.message || i18n.global.t('请求失败')))
  },
  async error => {
    endRequest()
    const originalRequest = error.config

    // 处理无config的错误（如网络错误、请求取消）
    if (!originalRequest) {
      const message = i18n.global.t(error.message || '网络错误') // i18n-key
      ElMessage.error(message)
      return Promise.reject(error)
    }

    // 处理HTTP 401错误（Token过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        originalRequest._retry = true
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return service(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      let tokenPair
      try {
        tokenPair = await refreshAccessToken()
      } catch (e) {
        processQueue(e, null)
        isRefreshing = false
        forceLogout()
        return Promise.reject(e)
      }
      // 刷新成功，处理队列并重试原请求
      const { accessToken, refreshToken: newRefreshToken } = tokenPair
      setAuth(accessToken, newRefreshToken)
      processQueue(null, accessToken)
      isRefreshing = false
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
      return service(originalRequest)
    }

    // HTTP 403错误（无权限）- 直接提示，不尝试刷新token
    if (error.response?.status === 403) {
      ElMessage.error(i18n.global.t('无权限访问'))
      return Promise.reject(error)
    }

    // 其他错误
    const message = i18n.global.t(error.response?.data?.message || error.message || '网络错误') // i18n-key
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
