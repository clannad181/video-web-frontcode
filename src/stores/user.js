/**
 * User Store
 * 用户状态管理，包含：
 * 1. 用户登录/登出
 * 2. 用户信息获取和更新
 * 3. 主题应用
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'
import { setAuth, clearAuth, setUser, getUser, setUserInfo, getUserInfo as getStoredUserInfo, getAppSettings, setAppSettings } from '@/utils/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // 用户token
  const token = ref('')
  // 用户详细信息
  const userInfo = ref(getStoredUserInfo())
  // 基本用户信息
  const user = ref(getUser())

  /**
   * 应用用户主题设置
   * @param {Number} userId - 用户ID
   */
  function applyTheme(userId) {
    const settings = getAppSettings(userId)
    if (settings) {
      if (settings.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor)
      }
      if (settings.compactMode) {
        document.documentElement.classList.add('compact-mode')
      } else {
        document.documentElement.classList.remove('compact-mode')
      }
    }
  }

  /**
   * 用户登录
   * @param {Object} loginData - 登录数据（用户名/密码等）
   */
  async function login(loginData) {
    const res = await loginApi(loginData)
    const { accessToken, refreshToken: refreshTokenValue } = res.data
    token.value = accessToken
    setAuth(accessToken, refreshTokenValue)

    try {
      // 获取用户详细信息
      const userRes = await getUserInfoApi()
      if (userRes.code === 200) {
        userInfo.value = userRes.data
        setUserInfo(userRes.data)
        user.value = {
          id: userRes.data.id,
          name: userRes.data.nikeName || userRes.data.nickname || userRes.data.username,
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
      // 获取用户信息失败时使用本地存储的数据
      const storedUser = getUser()
      if (storedUser) {
        user.value = storedUser
      } else {
        // 创建默认用户信息
        user.value = {
          id: 1,
          name: loginData.username || loginData.email,
          userName: loginData.username || loginData.email,
          email: loginData.email || '',
          avatar: '',
          roleId: 1,
          roleName: '超级管理员', // i18n-key
          roleLevel: 1,
          status: 1
        }
        setUser(user.value)
      }
    }

    router.push('/')
  }

  /**
   * 获取用户信息
   */
  async function getUserInfoAction() {
    try {
      const res = await getUserInfoApi()
      if (res.code === 200) {
        userInfo.value = res.data
        setUserInfo(res.data)
        user.value = {
          id: res.data.id,
          name: res.data.nikeName || res.data.nickname || res.data.username,
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

  /**
   * 用户登出
   */
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

  /**
   * 强制登出（不调用API）
   */
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
