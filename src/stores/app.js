import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: { collapsed: false },
    device: 'desktop',
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'zh-cn',
    darkMode: localStorage.getItem('darkMode') === 'true'
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },

    setLanguage(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', String(this.darkMode))
      this.applyDarkModeClass()
    },

    setDarkMode(dark) {
      this.darkMode = dark
      localStorage.setItem('darkMode', String(dark))
      this.applyDarkModeClass()
    },

    applyDarkModeClass() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    },

    setDevice(device) {
      this.device = device
    }
  }
})
