import request from './request'

export const login = (data) => request.post('/admin/user/login', data)

export const register = (data) => request.post('/admin/user/register', data)

export const logout = () => request.get('/admin/user/logout')

export const getUserInfo = () => request.get('/admin/user/info')

export const updateUserInfo = (data) => request.post('/admin/user/update', data)

export const getCaptcha = (params) => request.get('/admin/user/captcha', { params })

export const sendEmailCaptcha = (email) => request.post('/auth/send-captcha', { email })

export const resetPassword = (data) => request.post('/admin/user/reset-password', data)

export const getClientCaptcha = (params) => request.get('/client/user/captcha', { params })

export const sendRegisterCaptcha = (email) => request.get('/client/user/captcha', {
  params: {
    captchaType: 'register_email_captcha',
    email: email
  }
})

export const clientLogin = (data) => request.post('/client/user/login', data)

export const clientRegister = (data) => request.post('/client/user/register', data)

export const getClientUserInfo = () => request.get('/client/user/userInfo')

export const getUserInfoByUid = (uid) => request.get('/client/user/up-info', { params: { userUid: uid } })

export const clientLogout = () => request.get('/client/user/logout')

export const activateVip = (data) => request.post('/client/user/activate-vip', data)
