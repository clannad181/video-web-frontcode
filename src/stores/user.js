import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'
import { setAuth, clearAuth, setUser, getUser, setUserInfo, getUserInfo as getStoredUserInfo, getAppSettings, setAppSettings } from '@/utils/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(getStoredUserInfo())
  const user = ref(getUser())

  function applyTheme(userId) {
    const settings = getAppSettings(userId)
    if (settings) {
      if (settings.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor)
      }
      if (settings.darkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
      if (settings.compactMode) {
        document.documentElement.classList.add('compact-mode')
      } else {
        document.documentElement.classList.remove('compact-mode')
      }
    }
  }

  async function login(loginData) {
    const res = await loginApi(loginData)
    const { accessToken, refreshToken: refreshTokenValue } = res.data
    token.value = accessToken
    setAuth(accessToken, refreshTokenValue)

    try {
      const userRes = await getUserInfoApi()
      if (userRes.code === 200) {
        userInfo.value = userRes.data
        setUserInfo(userRes.data)
        user.value = {
          id: userRes.data.id,
          name: userRes.data.nickname || userRes.data.username,
          userName: userRes.data.username,
          email: userRes.data.email,
          avatar: userRes.data.avatar || userRes.data.avater,
          roleId: userRes.data.roleId,
          roleName: userRes.data.roleName,
          roleLevel: userRes.data.roleLevel,
          status: userRes.data.status
        }
        setUser(user.value)
        applyTheme(userRes.data.id)
      }
    } catch (e) {
      const storedUser = getUser()
      if (storedUser) {
        user.value = storedUser
      } else {
        user.value = {
          id: 1,
          name: loginData.username || loginData.email,
          userName: loginData.username || loginData.email,
          email: loginData.email || '',
          avatar: '',
          roleId: 1,
          roleName: '超级管理员',
          roleLevel: 1,
          status: 1
        }
        setUser(user.value)
      }
    }

    router.push('/')
  }

  async function getUserInfoAction() {
    try {
      const res = await getUserInfoApi()
      if (res.code === 200) {
        userInfo.value = res.data
        setUserInfo(res.data)
        user.value = {
          id: res.data.id,
          name: res.data.nickname || res.data.username,
          userName: res.data.username,
          email: res.data.email,
          avatar: res.data.avatar || res.data.avater,
          roleId: res.data.roleId,
          roleName: res.data.roleName,
          roleLevel: res.data.roleLevel,
          status: res.data.status
        }
        setUser(user.value)
        applyTheme(res.data.id)
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  async function logoutAction() {
    try {
      await logoutApi()
    } catch (e) {
      console.error('登出接口失败', e)
    }
    clearAuth()
    token.value = ''
    userInfo.value = null
    user.value = null
    router.push('/login')
  }

  function forceLogoutAction() {
    clearAuth()
    token.value = ''
    userInfo.value = null
    user.value = null
    window.location.href = '/login'
  }

  return {
    token,
    userInfo,
    user,
    login,
    getUserInfoAction,
    logoutAction,
    forceLogoutAction,
    applyTheme
  }
})
