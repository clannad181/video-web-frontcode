import { createI18n } from 'vue-i18n'
import zhCn from './zh-cn'
import en from './en'

/**
 * 每个模块的文案放在 src/locales/messages/*.js：
 *   export default { '中文原文': 'English' }
 * 中文原文即为 key，新增/修改文件会自动合并，无需改动本文件。
 */
const modules = import.meta.glob('./messages/*.js', { eager: true, import: 'default' })

const flatEn = {}
for (const p of Object.keys(modules).sort()) Object.assign(flatEn, modules[p] || {})

// 中文语言包：key 本身就是中文，直接用 key 作值（保证 {total} 之类插值能正常生效）
const flatZh = {}
for (const k of Object.keys(flatEn)) flatZh[k] = k

const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('language') || 'zh-cn') : 'zh-cn'

const i18n = createI18n({
  legacy: false,
  locale: saved,
  // 缺 key 时回退到中文（key 即中文），英文缺失能被肉眼发现
  fallbackLocale: 'zh-cn',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'zh-cn': { ...flatZh, ...zhCn },
    en: { ...flatEn, ...en }
  }
})

export default i18n
