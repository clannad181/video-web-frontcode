export function getDashboardStats() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          totalUsers: 56789,
          todayNewUsers: 123,
          totalVideos: 12345,
          todayNewVideos: 45,
          totalViews: 9876543,
          todayViews: 23456,
          totalComments: 234567,
          todayComments: 567,
          todayActive: 892,
          todayUploads: 45,
          todayLogins: 1567
        },
        message: 'success'
      })
    }, 500)
  })
}

export function getVisitTrend(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const days = params?.days || 7
      const data = Array.from({ length: days }, (_, i) => ({
        date: `2024-06-${String(i + 1).padStart(2, '0')}`,
        views: Math.floor(Math.random() * 50000) + 10000,
        users: Math.floor(Math.random() * 1000) + 200
      }))
      resolve({ code: 200, data, message: 'success' })
    }, 300)
  })
}

export function getVideoRanking() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          title: `热门视频 ${i + 1}`,
          views: Math.floor(Math.random() * 1000000) + 100000,
          likes: Math.floor(Math.random() * 100000) + 10000
        })),
        message: 'success'
      })
    }, 300)
  })
}

export function getCategoryDistribution() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          { name: '科技', value: 2345 },
          { name: '游戏', value: 1890 },
          { name: '生活', value: 1567 },
          { name: '教育', value: 1234 },
          { name: '娱乐', value: 987 }
        ],
        message: 'success'
      })
    }, 300)
  })
}

export function getVideoTrend(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const days = params?.days || 7
      const data = Array.from({ length: days }, (_, i) => ({
        date: `2024-06-${String(i + 1).padStart(2, '0')}`,
        uploadCount: Math.floor(Math.random() * 60) + 20,
        playCount: Math.floor(Math.random() * 50000) + 10000
      }))
      resolve({ code: 200, data, message: 'success' })
    }, 300)
  })
}

export function getUserActivityTrend(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const days = params?.days || 7
      const data = Array.from({ length: days }, (_, i) => ({
        date: `2024-06-${String(i + 1).padStart(2, '0')}`,
        activeUsers: Math.floor(Math.random() * 800) + 400,
        loginUsers: Math.floor(Math.random() * 1200) + 600,
        newUsers: Math.floor(Math.random() * 200) + 50
      }))
      resolve({ code: 200, data, message: 'success' })
    }, 300)
  })
}

export function getCategoryDailyIncrement(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const days = params?.days || 7
      const categories = ['科技', '游戏', '生活', '教育', '娱乐']
      const data = Array.from({ length: days }, (_, i) => {
        const item = { date: `2024-06-${String(i + 1).padStart(2, '0')}` }
        categories.forEach(cat => {
          item[cat] = Math.floor(Math.random() * 30) + 5
        })
        return item
      })
      resolve({ code: 200, data, message: 'success' })
    }, 300)
  })
}

export function getRealtimeVisitors() {
  return new Promise(resolve => {
    setTimeout(() => {
      const pages = ['首页', '视频详情', '搜索', '个人中心', '分类列表', '排行榜']
      const locations = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京']
      const data = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        ip: `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        duration: Math.floor(Math.random() * 300) + 10,
        userAgent: ['Chrome 120', 'Safari 17', 'Firefox 121', 'Edge 120'][Math.floor(Math.random() * 4)]
      }))
      resolve({ code: 200, data, message: 'success' })
    }, 300)
  })
}
