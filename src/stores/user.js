import { defineStore } from 'pinia'
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/utils/auth'
import { loginApi, logoutApi, getUserInfoApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: {},
    roles: [],
    menus: []
  }),

  actions: {
    async login(credentials) {
      const res = await loginApi(credentials)
      this.token = res.data.accessToken
      setToken(res.data.accessToken)
      setRefreshToken(res.data.refreshToken)
      return res
    },

    async logout() {
      try {
        await logoutApi()
      } finally {
        this.resetState()
      }
    },

    async getUserInfo() {
      const res = await getUserInfoApi()
      this.userInfo = res.data.user
      this.roles = res.data.roles
      this.menus = res.data.menus
      return res
    },

    generateRoutes() {
      return this.menus
    },

    resetState() {
      this.token = ''
      this.userInfo = {}
      this.roles = []
      this.menus = []
      removeToken()
      removeRefreshToken()
    }
  }
})
