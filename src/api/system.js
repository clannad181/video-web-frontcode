import request from '@/utils/request'

export function getSystemSettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          siteName: '视频管理系统',
          siteDescription: '一个功能强大的视频管理后台系统',
          siteUrl: 'https://example.com',
          defaultLanguage: 'zh-CN',
          timezone: 'Asia/Shanghai',
          logo: '',
          icp: '京ICP备12345678号'
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateSystemSettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getSecuritySettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumber: true,
          passwordRequireSpecial: false,
          twoFactorAuth: false,
          loginNotification: true,
          sessionTimeout: 120,
          sessionTimeoutUnit: 'minutes',
          lockAfterAttempts: 5,
          lockDuration: 30,
          lockDurationUnit: 'minutes',
          ipWhitelist: ['192.168.1.0/24', '10.0.0.1']
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateSecuritySettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getTokenSettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          frontAccessTokenValue: 2,
          frontAccessTokenUnit: 'hours',
          frontRefreshTokenValue: 7,
          frontRefreshTokenUnit: 'days',
          backAccessTokenValue: 8,
          backAccessTokenUnit: 'hours',
          backRefreshTokenValue: 30,
          backRefreshTokenUnit: 'days',
          autoRenew: true,
          algorithm: 'HS256',
          issuedTokens: 1234,
          activeTokens: 567
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateTokenSettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getNotificationSettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          videoAuditComplete: true,
          commentReplied: true,
          commentReported: true,
          videoReported: true,
          userRegistered: false,
          siteNotification: true,
          emailNotification: false
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateNotificationSettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getAppearanceSettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          primaryColor: '#409eff',
          darkMode: false,
          compactMode: false,
          sidebarTheme: 'dark',
          fontSize: 14
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateAppearanceSettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getAuditConfig() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          videoAudit: true,
          commentAudit: true,
          autoReject: false,
          sensitiveWordFilter: true,
          sensitiveWords: ['敏感词1', '敏感词2'],
          notifyOnAudit: true
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateAuditConfig(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getDefaultSettings() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          defaultRole: 'user',
          userEnabled: true,
          defaultCategory: 'uncategorized',
          defaultVideoStatus: 'pending',
          defaultCommentStatus: 'normal',
          defaultDanmakuStatus: 'normal'
        },
        message: 'success'
      })
    }, 300)
  })
}

export function updateDefaultSettings(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function getSystemInfo() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          version: '1.0.0',
          nodeVersion: 'v18.17.0',
          os: 'Linux',
          uptime: 864000,
          cpuUsage: 23.5,
          memoryUsage: 67.8,
          diskUsage: 45.2,
          totalMemory: 8589934592,
          usedMemory: 5805232128,
          totalDisk: 107374182400,
          usedDisk: 48552458240,
          databaseSize: 1073741824,
          videoCount: 12345,
          userCount: 56789,
          commentCount: 234567,
          danmakuCount: 890123
        },
        message: 'success'
      })
    }, 500)
  })
}
