import request from '@/utils/request'

export function getCaptcha(key, captchaType = 'img_captcha', email = '') {
  return request({
    url: '/admin/user/captcha',
    method: 'get',
    params: { key, captchaType, email }
  })
}

export function login(data) {
  return request({
    url: '/admin/user/login',
    method: 'post',
    data
  })
}

export function refreshToken(refreshToken) {
  return request({
    url: '/admin/user/refresh',
    method: 'get',
    headers: {
      'refresh-token': refreshToken
    }
  })
}

export function getUserInfo() {
  return request({
    url: '/admin/user/userInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin/user/logout',
    method: 'get'
  })
}

export function sendEmailCode(email) {
  return request({
    url: '/admin/user/sendEmailCode',
    method: 'post',
    data: { email }
  })
}
