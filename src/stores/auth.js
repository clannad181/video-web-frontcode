import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getClientUserInfo } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('frontAccessToken'))
  const refreshToken = ref(localStorage.getItem('frontRefreshToken'))
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  async function init() {
    const cached = localStorage.getItem('frontUser')
    if (cached) {
      try { user.value = JSON.parse(cached) } catch {}
    }
    if (token.value) {
      try {
        const info = await getClientUserInfo()
        if (info) {
          user.value = info
          localStorage.setItem('frontUser', JSON.stringify(info))
        }
      } catch {}
    }
  }

  function login(accessToken, refreshTokenValue, userInfo) {
    token.value = accessToken
    refreshToken.value = refreshTokenValue
    localStorage.setItem('frontAccessToken', accessToken)
    if (refreshTokenValue) localStorage.setItem('frontRefreshToken', refreshTokenValue)
    if (userInfo) {
      user.value = userInfo
      localStorage.setItem('frontUser', JSON.stringify(userInfo))
    }
  }

  function refreshTokens(newAccessToken, newRefreshToken) {
    token.value = newAccessToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('frontAccessToken', newAccessToken)
    if (newRefreshToken) localStorage.setItem('frontRefreshToken', newRefreshToken)
  }

  function logout() {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('frontAccessToken')
    localStorage.removeItem('frontRefreshToken')
    localStorage.removeItem('frontUser')
  }

  return { token, refreshToken, user, isLoggedIn, init, login, refreshTokens, logout }
})
