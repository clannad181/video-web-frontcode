/**
 * App Store
 * 全局应用状态管理，包含：
 * 1. 侧边栏折叠状态
 * 2. 设备类型
 * 3. 主题设置
 * 4. 语言设置
 * 5. 深色模式设置
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 侧边栏状态
    sidebar: { collapsed: false },
    // 设备类型（desktop/mobile）
    device: 'desktop',
    // 主题（light/dark）
    theme: localStorage.getItem('theme') || 'light',
    // 语言（zh-cn/en）
    language: localStorage.getItem('language') || 'zh-cn',
    // 深色模式开关
    darkMode: localStorage.getItem('darkMode') === 'true'
  }),

  actions: {
    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    /**
     * 设置主题
     * @param {String} theme - 主题名称（light/dark）
     */
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },

    /**
     * 设置语言
     * @param {String} lang - 语言代码（zh-cn/en）
     */
    setLanguage(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
    },

    /**
     * 切换深色模式
     */
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', String(this.darkMode))
      this.applyDarkModeClass()
    },

    /**
     * 设置深色模式
     * @param {Boolean} dark - 是否启用深色模式
     */
    setDarkMode(dark) {
      this.darkMode = dark
      localStorage.setItem('darkMode', String(dark))
      this.applyDarkModeClass()
    },

    /**
     * 应用深色模式CSS类到HTML元素
     */
    applyDarkModeClass() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    },

    /**
     * 设置设备类型
     * @param {String} device - 设备类型（desktop/mobile）
     */
    setDevice(device) {
      this.device = device
    }
  }
})
