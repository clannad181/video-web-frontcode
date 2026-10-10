import { reactive } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

/**
 * Element Plus 运行时配置
 * 必须是响应式对象：app.use(ElementPlus, epConfig) 内部用 computed 读取，
 * 只有对象本身是 reactive，切换 locale 后组件才会重新取语言包
 */
export const EP_LOCALES = { 'zh-cn': zhCn, en }

const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('language') || 'zh-cn') : 'zh-cn'

export const epConfig = reactive({
  locale: EP_LOCALES[saved] || zhCn,
  size: 'default'
})

/** 跟随应用语言切换 Element Plus 组件语言（分页、对话框、选择器等） */
export function applyEpLocale(lang) {
  epConfig.locale = EP_LOCALES[lang] || zhCn
}
