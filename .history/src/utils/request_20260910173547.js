import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, getRefreshToken, setAuth, clearAuth } from './auth'
import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

let isRefreshing = false
let failedQueue = []

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

function forceLogout() {
  clearAuth()
  window.location.href = '/login'
}

service.interceptors.request.use(
  config => {
    NProgress.start()
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    NProgress.done()
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    NProgress.done()
    const res = response.data
    if (res.code === 200) {
      return res
    }
    if (res.code === 401) {
      return Promise.reject(new Error('Token expired'))
    }
    if (res.code === 403) {
      ElMessage.error('未登录或无权限')
      forceLogout()
      return Promise.reject(new Error(res.message || '未登录'))
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  async error => {
    NProgress.done()
    const originalRequest = error.config

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return service(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshTokenValue = getRefreshToken()
      if (refreshTokenValue) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/user/refresh`,
            {
              headers: { 'refresh-token': refreshTokenValue }
            }
          )
          if (res.data.code === 200) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data
            setAuth(accessToken, newRefreshToken)
            processQueue(null, accessToken)
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
            return service(originalRequest)
          } else {
            processQueue(new Error('Refresh failed'), null)
            forceLogout()
          }
        } catch (e) {
          processQueue(e, null)
          forceLogout()
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      } else {
        forceLogout()
      }
    }

    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
