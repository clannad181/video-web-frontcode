import request from './request'

const dbToFrontendMap = {
  'site_name': 'siteName',
  'site_desc': 'siteDesc',
  'site_url': 'siteUrl',
  'language': 'language',
  'timezone': 'timezone',
  'primary_color': 'primaryColor',
  'dark_mode': 'darkMode',
  'compact_mode': 'compactMode',
  'video_review': 'videoReview',
  'comment_review': 'commentReview',
  'sensitive_word_filter': 'sensitiveWordFilter',
  'default_role': 'defaultRole',
  'default_category': 'defaultCategory',
  'front_access_token_expiry': 'frontAccessTokenExpiry',
  'front_refresh_token_expiry': 'frontRefreshTokenExpiry',
  'two_factor': 'twoFactor',
  'login_notify': 'loginNotify',
  'email_notify': 'emailNotify',
  'session_timeout': 'sessionTimeout'
}

const booleanKeys = new Set([
  'twoFactor', 'loginNotify', 'emailNotify',
  'darkMode', 'compactMode',
  'videoReview', 'commentReview', 'sensitiveWordFilter'
])
const numberKeys = new Set(['sessionTimeout'])
const minuteKeys = new Set(['frontAccessTokenExpiry'])
const dayKeys = new Set(['frontRefreshTokenExpiry'])

function castValue(key, value) {
  if (booleanKeys.has(key)) return value === 'true'
  if (numberKeys.has(key)) return Number(value)
  if (minuteKeys.has(key)) return Number(value) / 60 / 1000
  if (dayKeys.has(key)) return Number(value) / 24 / 60 / 60 / 1000
  return value
}

export async function getSettings() {
  try {
    const list = await request.get('/admin/config/list')
    if (list && Array.isArray(list)) {
      const result = {}
      for (const item of list) {
        const frontendKey = dbToFrontendMap[item.key] || item.key
        result[frontendKey] = castValue(frontendKey, item.value)
      }
      return result
    }
    return {}
  } catch {
    return {}
  }
}
