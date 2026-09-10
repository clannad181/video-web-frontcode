import request from '@/utils/request'

export function getVideoList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        title: `视频标题 ${i + 1}`,
        cover: '',
        description: `这是视频描述 ${i + 1}，包含详细的内容介绍`,
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${i + 1}`,
        categoryId: Math.floor(Math.random() * 10) + 1,
        duration: Math.floor(Math.random() * 3600) + 60,
        viewCount: Math.floor(Math.random() * 100000),
        likeCount: Math.floor(Math.random() * 10000),
        coinCount: Math.floor(Math.random() * 5000),
        shareCount: Math.floor(Math.random() * 2000),
        commentCount: Math.floor(Math.random() * 1000),
        danmakuCount: Math.floor(Math.random() * 5000),
        serialStatus: Math.random() > 0.5 ? 1 : 0,
        auditStatus: Math.floor(Math.random() * 3),
        videoStatus: Math.floor(Math.random() * 4),
        tags: ['科技', '编程', '生活'].slice(0, Math.floor(Math.random() * 3) + 1),
        publishTime: '2024-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' 12:00:00',
        createTime: '2024-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' 12:00:00'
      }))
      resolve({ code: 200, data: { list, total: 100 }, message: 'success' })
    }, 500)
  })
}

export function getVideoDetail(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          id,
          title: '示例视频标题',
          cover: '',
          description: '这是视频的详细描述，包含多行文字内容，用于展示视频的完整信息。',
          url: 'https://example.com/video.mp4',
          userId: 1,
          username: 'admin',
          categoryId: 1,
          duration: 1200,
          viewCount: 12345,
          likeCount: 678,
          coinCount: 320,
          shareCount: 150,
          commentCount: 90,
          danmakuCount: 200,
          tags: ['科技', '编程', '教程'],
          serialStatus: 1,
          auditStatus: 1,
          videoStatus: 1,
          publishTime: '2024-06-15 10:00:00',
          createTime: '2024-06-01 00:00:00',
          updateTime: '2024-06-01 12:00:00',
          episodes: [
            { id: 1, title: '第1集 - 开篇', url: '', duration: 1200 },
            { id: 2, title: '第2集 - 发展', url: '', duration: 980 },
            { id: 3, title: '第3集 - 高潮', url: '', duration: 1100 }
          ]
        },
        message: 'success'
      })
    }, 300)
  })
}

export function createVideo(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { id: Date.now() }, message: 'success' })
    }, 500)
  })
}

export function updateVideo(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteVideo(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function batchDeleteVideo(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function auditVideo(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function uploadVideo(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: { url: 'https://example.com/uploaded_video.mp4', videoId: Date.now() },
        message: 'success'
      })
    }, 2000)
  })
}
