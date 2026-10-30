/**
 * 图片/视频等静态资源地址统一拼接
 * 一律走 OSS_BASE_URL（VITE_OSS_BASE_URL）
 * - data:/blob: 原样返回
 * - 已带 OSS_BASE_URL 前缀的地址原样返回
 * - 绝对地址：同源或 OSS 主机的改写为 OSS_BASE_URL + path，外部地址原样返回
 * - 相对路径：拼接 OSS_BASE_URL
 */
import { OSS_BASE_URL } from '@/config'

const ABSOLUTE_RE = /^(https?:)?\/\//i

export function resUrl(u) {
  if (!u || typeof u !== 'string') return ''
  if (/^(data:|blob:)/i.test(u)) return u
  if (!OSS_BASE_URL) return u
  if (u.startsWith(OSS_BASE_URL)) return u
  if (ABSOLUTE_RE.test(u)) {
    try {
      const url = new URL(u, window.location.origin)
      const ossHost = new URL(OSS_BASE_URL, window.location.origin).host
      if (url.host === window.location.host || url.host === ossHost) {
        return OSS_BASE_URL + url.pathname + url.search
      }
      return u
    } catch {
      return u
    }
  }
  return OSS_BASE_URL + (u.startsWith('/') ? u : '/' + u)
}

export default resUrl
