const STORAGE_KEY_PREFIX = 'front_settings'

function getStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('frontUser') || '{}')
    return user.id ? `${STORAGE_KEY_PREFIX}_${user.id}` : STORAGE_KEY_PREFIX
  } catch {
    return STORAGE_KEY_PREFIX
  }
}

export const defaultSettings = {
  siteName: 'VideoHub',
  siteDesc: '视频平台',
  siteUrl: 'https://videohub.com',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  primaryColor: '#fb7299',
  darkMode: false,
  compactMode: false,
  videoReview: false,
  commentReview: false,
  sensitiveWordFilter: false
}

const themePresets = {
  '#fb7299': { hover: '#e6608a', light: 'rgba(251, 114, 153, 0.1)' },
  '#00a1d6': { hover: '#0090bc', light: 'rgba(0, 161, 214, 0.1)' },
  '#7c5cfc': { hover: '#6a4ae0', light: 'rgba(124, 92, 252, 0.1)' },
  '#ff8c42': { hover: '#e67a35', light: 'rgba(255, 140, 66, 0.1)' },
  '#4caf50': { hover: '#43a047', light: 'rgba(76, 175, 80, 0.1)' }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) }
    }
  } catch {}
  return { ...defaultSettings }
}

export function saveSettings(settings) {
  localStorage.setItem(getStorageKey(), JSON.stringify(settings))
}

export function applyPrimaryColor(hex) {
  const root = document.documentElement
  const preset = themePresets[hex]
  if (preset) {
    root.style.setProperty('--color-primary', hex)
    root.style.setProperty('--color-primary-hover', preset.hover)
    root.style.setProperty('--color-primary-light', preset.light)
  } else {
    const { r, g, b } = hexToRgb(hex)
    root.style.setProperty('--color-primary', hex)
    root.style.setProperty('--color-primary-hover', hex)
    root.style.setProperty('--color-primary-light', `rgba(${r}, ${g}, ${b}, 0.1)`)
  }
}

export function applyDarkMode(enabled) {
  const root = document.documentElement
  if (enabled) {
    root.classList.add('dark-mode')
  } else {
    root.classList.remove('dark-mode')
  }
}

export function applyCompactMode(enabled) {
  const root = document.documentElement
  if (enabled) {
    root.classList.add('compact-mode')
  } else {
    root.classList.remove('compact-mode')
  }
}

export function applyAllSettings(settings) {
  if (settings.primaryColor) applyPrimaryColor(settings.primaryColor)
  if (settings.darkMode !== undefined) applyDarkMode(settings.darkMode)
  if (settings.compactMode !== undefined) applyCompactMode(settings.compactMode)
}
