/**
 * 应用配置
 */
function normalizeBase(value) {
  if (!value) return ''
  let v = String(value).trim()
  if (!/^(https?:)?\/\//i.test(v) && !v.startsWith('/')) {
    v = `http://${v}`
  }
  return v.replace(/\/+$/, '')
}

function resolveBase(key, envKey, fallback) {
  const runtime = window.__APP_CONFIG__ ? window.__APP_CONFIG__[key] : ''
  return normalizeBase(runtime || import.meta.env[envKey] || fallback)
}

export const API_BASE_URL = resolveBase('API_BASE_URL', 'VITE_API_BASE_URL', '/api')

export const FILE_BASE_URL = resolveBase('FILE_BASE_URL', 'VITE_FILE_BASE_URL', '')

export function fileUrl(path) {
  if (!path || typeof path !== 'string') return path ?? ''
  if (/^(https?:|blob:|data:|\/\/)/i.test(path)) return path
  if (!FILE_BASE_URL) return path
  if (path.startsWith(FILE_BASE_URL)) return path
  return FILE_BASE_URL + path
}

export default {
  // WebSocket 配置
  websocket: {
    // 是否启用 WebSocket 实时消息推送（true: 启用, false: 关闭）
    enabled: true
  }
}
