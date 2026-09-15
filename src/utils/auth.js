/**
 * Auth 工具函数
 * 本地存储管理，包含：
 * 1. Token管理（访问令牌和刷新令牌）
 * 2. 用户信息管理
 * 3. 应用设置管理
 */

// 本地存储键名常量
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'
const USER_INFO_KEY = 'userInfo'

/**
 * 获取访问令牌
 * @returns {String} 访问令牌
 */
export function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 设置访问令牌
 * @param {String} token - 访问令牌
 */
export function setToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * 获取刷新令牌
 * @returns {String} 刷新令牌
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 设置刷新令牌
 * @param {String} token - 刷新令牌
 */
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 同时设置访问令牌和刷新令牌
 * @param {String} accessToken - 访问令牌
 * @param {String} refreshToken - 刷新令牌
 */
export function setAuth(accessToken, refreshToken) {
  setToken(accessToken)
  setRefreshToken(refreshToken)
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 获取用户基本信息
 * @returns {Object|null} 用户信息对象
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 设置用户基本信息
 * @param {Object} user - 用户信息对象
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 获取用户详细信息
 * @returns {Object|null} 用户详细信息对象
 */
export function getUserInfo() {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 设置用户详细信息
 * @param {Object} info - 用户详细信息对象
 */
export function setUserInfo(info) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

/**
 * 清除用户信息
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 获取应用设置
 * @param {Number} userId - 用户ID
 * @returns {Object|null} 应用设置对象
 */
export function getAppSettings(userId) {
  try {
    const raw = localStorage.getItem(`app_settings_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 设置应用设置
 * @param {Number} userId - 用户ID
 * @param {Object} settings - 应用设置对象
 */
export function setAppSettings(userId, settings) {
  localStorage.setItem(`app_settings_${userId}`, JSON.stringify(settings))
}
