import request from '@/utils/request'

export function loginApi(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 7200
        },
        message: 'success'
      })
    }, 500)
  })
}

export function logoutApi() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function refreshTokenApi(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          accessToken: 'mock_new_access_token_' + Date.now(),
          refreshToken: 'mock_new_refresh_token_' + Date.now(),
          expiresIn: 7200
        },
        message: 'success'
      })
    }, 300)
  })
}

export function getCaptchaApi() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          captchaId: 'mock_captcha_' + Date.now(),
          captchaImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMCIgeT0iMjgiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiPkFCQ0Q8L3RleHQ+PC9zdmc+'
        },
        message: 'success'
      })
    }, 200)
  })
}

export function getUserInfoApi() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          user: {
            id: 1,
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            email: 'admin@example.com',
            phone: '13800138000',
            status: 1,
            createTime: '2024-01-01 00:00:00'
          },
          roles: ['admin'],
          menus: [
            { path: '/dashboard', name: 'Dashboard', title: '工作台', icon: 'Odometer', component: '/dashboard/index' }
          ]
        },
        message: 'success'
      })
    }, 300)
  })
}
