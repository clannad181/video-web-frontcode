import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

let isRefreshing = false
let failedQueue = []
let tokenExpiredHandler = null

export function setTokenExpiredHandler(handler) {
  tokenExpiredHandler = handler
}

function notifyTokenExpired() {
  if (tokenExpiredHandler) {
    tokenExpiredHandler()
  }
}

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

window.addEventListener('beforeunload', () => {
  isRefreshing = false
  failedQueue = []
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('frontAccessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const refreshToken = localStorage.getItem('frontRefreshToken')
    if (refreshToken) {
      config.headers['refresh-token'] = refreshToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200 || res.code === 0) {
      if (response.config.returnFull) return res
      return res.data
    }
    // JWT过期或无效，清除登录状态
    if (res.code === 500 && res.message && res.message.includes('JWT')) {
      localStorage.removeItem('frontAccessToken')
      localStorage.removeItem('frontRefreshToken')
      localStorage.removeItem('frontUser')
      notifyTokenExpired()
    }
    // 401未登录，直接在拦截器中处理刷新
    if (res.code === 401) {
      const refreshToken = localStorage.getItem('frontRefreshToken')
      const originalRequest = response.config
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return request(originalRequest)
          })
        }
        
        isRefreshing = true
        return axios.get('/api/client/user/refresh', {
          headers: { 'refresh-token': refreshToken }
        }).then(res => {
          if (res.data.code === 200) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data
            localStorage.setItem('frontAccessToken', accessToken)
            if (newRefreshToken) {
              localStorage.setItem('frontRefreshToken', newRefreshToken)
            }
            
            processQueue(null, accessToken)
            
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return request(originalRequest)
          } else {
            processQueue(new Error('刷新token失败'), null)
            localStorage.removeItem('frontAccessToken')
            localStorage.removeItem('frontRefreshToken')
            localStorage.removeItem('frontUser')
            notifyTokenExpired()
            return Promise.reject(new Error('刷新token失败'))
          }
        }).catch(refreshError => {
          processQueue(refreshError, null)
          localStorage.removeItem('frontAccessToken')
          localStorage.removeItem('frontRefreshToken')
          localStorage.removeItem('frontUser')
          notifyTokenExpired()
          return Promise.reject(refreshError)
        }).finally(() => {
          isRefreshing = false
        })
      } else {
        localStorage.removeItem('frontAccessToken')
        localStorage.removeItem('frontRefreshToken')
        localStorage.removeItem('frontUser')
        notifyTokenExpired()
        return Promise.reject(new Error('未登录'))
      }
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  async (error) => {
    return Promise.reject(error)
  }
)

export default request
