import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.js'
import enUS from './locales/en-US.js'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const savedLocale = localStorage.getItem('frontLocale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n
