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

// 主题切换过渡定时器（模块级，避免被 Pinia 响应式代理）
let themeTransitionTimer = null

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
    darkMode: localStorage.getItem('darkMode') === 'true',
    // 侧边栏样式（dark/light）
    sidebarStyle: localStorage.getItem('sidebarStyle') || 'dark',
    // 全局字体
    fontFamily: localStorage.getItem('fontFamily') || '默认',
    // 字体大小
    fontSize: localStorage.getItem('fontSize') || '14'
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
     * @param {Boolean} animate - 是否播放切换动画（初始化时传 false）
     */
    setDarkMode(dark, animate = true) {
      this.darkMode = dark
      localStorage.setItem('darkMode', String(dark))
      this.applyDarkModeClass(animate)
    },

    /**
     * 设置侧边栏样式
     * @param {String} style - 样式（dark/light）
     */
    setSidebarStyle(style) {
      this.sidebarStyle = style
      localStorage.setItem('sidebarStyle', style)
    },

    /**
     * 应用深色模式CSS类到HTML元素
     * 优先使用 View Transitions API 做整屏快照交叉淡化（所有元素严格同步）；
     * 不支持的浏览器降级为临时过渡类方案
     * @param {Boolean} animate - 是否播放切换动画（初始化时传 false）
     */
    applyDarkModeClass(animate = true) {
      const root = document.documentElement
      const apply = () => {
        if (this.darkMode) {
          root.classList.add('dark-mode')
        } else {
          root.classList.remove('dark-mode')
        }
      }

      if (!animate) {
        apply()
        return
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(apply)
        return
      }

      // 降级方案：先加临时过渡类
      root.classList.add('theme-transition')
      // 强制浏览器同步重排，让 transition 属性先生效，再切换颜色才能触发动画
      void root.offsetHeight
      apply()

      // 过渡结束后移除临时类，恢复正常交互（hover 等）
      clearTimeout(themeTransitionTimer)
      themeTransitionTimer = setTimeout(() => {
        root.classList.remove('theme-transition')
      }, 350)
    },

    /**
     * 设置设备类型
     * @param {String} device - 设备类型（desktop/mobile）
     */
    setDevice(device) {
      this.device = device
    },

    /**
     * 设置全局字体
     * @param {String} font - 字体名称
     */
    setFontFamily(font) {
      this.fontFamily = font
      localStorage.setItem('fontFamily', font)
      this.applyFontFamily()
    },

    /**
     * 设置字体大小
     * @param {String} size - 字体大小
     */
    setFontSize(size) {
      this.fontSize = size
      localStorage.setItem('fontSize', size)
      this.applyFontSize()
    },

    /**
     * 应用字体到全局
     */
    applyFontFamily() {
      const fontMap = {
        '默认': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        '微软雅黑': "'Microsoft YaHei', sans-serif",
        '宋体': "'SimSun', serif",
        '黑体': "'SimHei', sans-serif",
        '楷体': "'KaiTi', serif",
        '仿宋': "'FangSong', serif",
        '思源黑体': "'Noto Sans SC', sans-serif",
        '思源宋体': "'Noto Serif SC', serif",
        '苹方': "'PingFang SC', 'Helvetica Neue', sans-serif",
        '等线': "'DengXian', sans-serif"
      }
      const fontFamily = fontMap[this.fontFamily] || fontMap['默认']
      document.documentElement.style.setProperty('--font-family', fontFamily)
    },

    /**
     * 应用字体大小到全局
     */
    applyFontSize() {
      const size = parseInt(this.fontSize) || 14
      const ratio = size / 14
      // 更新自定义CSS变量
      document.documentElement.style.setProperty('--font-size-base', `${size}px`)
      document.documentElement.style.setProperty('--font-size-sm', `${Math.round(12 * ratio)}px`)
      document.documentElement.style.setProperty('--font-size-lg', `${Math.round(16 * ratio)}px`)
      // 动态注入样式覆盖Element Plus字号 + 全局通用元素
      let styleEl = document.getElementById('dynamic-font-size')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'dynamic-font-size'
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `
        html { font-size: ${size}px !important; }
        body { font-size: ${size}px !important; }
        :root {
          --el-font-size-extra-large: ${Math.round(18 * ratio)}px !important;
          --el-font-size-large: ${Math.round(16 * ratio)}px !important;
          --el-font-size-medium: ${size}px !important;
          --el-font-size-base: ${size}px !important;
          --el-font-size-small: ${Math.round(13 * ratio)}px !important;
          --el-font-size-extra-small: ${Math.round(12 * ratio)}px !important;
        }
        /* Element Plus 组件 */
        .el-button, .el-input, .el-select, .el-textarea,
        .el-table, .el-dialog, .el-card, .el-tag, .el-menu,
        .el-pagination, .el-form-item__label, .el-dropdown-menu__item,
        .el-checkbox__label, .el-radio__label,
        .el-collapse-item__header, .el-transfer__panel,
        .el-statistic__head, .el-statistic__content,
        .el-result__title, .el-result__subtitle,
        .el-empty__description, .el-page-header__title,
        .el-breadcrumb__item, .el-tabs__item,
        .el-step__title, .el-alert__title, .el-alert__description,
        .el-divider__text, .el-timeline-item__timestamp,
        .el-table__header th, .el-table__body td,
        .el-popover__title, .el-message-box__title,
        .el-message-box__content, .el-notification__title,
        .el-notification__content, .el-drawer__header,
        .el-color-picker__trigger, .el-date-editor .el-input__inner,
        .el-cascader, .el-slider__runway, .el-slider__button-wrapper span,
        .el-date-editor .el-range-input {
          font-size: ${size}px !important;
        }
        .el-dialog__title { font-size: ${Math.round(16 * ratio)}px !important; }
        .el-message-box__title { font-size: ${Math.round(16 * ratio)}px !important; }
        .el-table th { font-size: ${Math.round(13 * ratio)}px !important; }
        /* 通用页面元素 */
        p, span, div, a, li, td, th, label, input, textarea, select,
        h1, h2, h3, h4, h5, h6 {
          font-size: inherit;
        }
        /* 侧边栏 */
        .sidebar-menu .el-menu-item,
        .sidebar-menu .el-sub-menu__title,
        .sidebar-link, .menu-title, .submenu-item {
          font-size: ${size}px !important;
        }
        .logo-text { font-size: ${Math.round(18 * ratio)}px !important; }
        .user-name { font-size: ${size}px !important; }
        .user-role { font-size: ${Math.round(11 * ratio)}px !important; }
        /* 导航栏 */
        .breadcrumb-item { font-size: ${Math.round(13 * ratio)}px !important; }
        .nav-username { font-size: ${size}px !important; }
        /* 卡片标题 */
        .card-header__title, .stat-label { font-size: ${size}px !important; }
        .stat-value { font-size: ${Math.round(28 * ratio)}px !important; }
        /* 表格 */
        .el-table .cell { font-size: ${Math.round(13 * ratio)}px !important; }
        .data-table td, .data-table th { font-size: ${Math.round(13 * ratio)}px !important; }
        .col-data.mono, .col-serial, .col-audit, .col-status { font-size: ${Math.round(13 * ratio)}px !important; }
      `
    }
  }
})
