import request from '@/utils/request'

export function getCommentList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        content: `这是评论内容 ${i + 1}，包含一些有趣的讨论和用户的真实想法`,
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${i + 1}`,
        avatar: '',
        videoId: Math.floor(Math.random() * 50) + 1,
        videoTitle: `视频标题 ${Math.floor(Math.random() * 50) + 1}`,
        parentId: i > 3 ? Math.floor(Math.random() * 4) + 1 : 0,
        likeCount: Math.floor(Math.random() * 500),
        replyCount: Math.floor(Math.random() * 50),
        status: Math.random() > 0.15 ? 1 : [0, 2, 3][Math.floor(Math.random() * 3)],
        createTime: '2024-' + String(Math.floor(Math.random() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00:00'
      }))
      resolve({ code: 200, data: { list, total: 200 }, message: 'success' })
    }, 500)
  })
}

export function getCommentDetail(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          id,
          content: '这是一条详细的评论内容，用户在这里分享了他们的看法和建议。',
          userId: 1,
          username: 'user1',
          avatar: '',
          videoId: 1,
          videoTitle: '示例视频',
          parentId: 0,
          likeCount: 100,
          replyCount: 20,
          status: 1,
          createTime: '2024-06-01 12:00:00'
        },
        message: 'success'
      })
    }, 300)
  })
}

export function deleteComment(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function batchDeleteComment(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function auditComment(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}
