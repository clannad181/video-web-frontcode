import request from '@/utils/request'

export function getDanmakuList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const danmakuContents = [
        '哈哈哈太搞笑了', '前方高能', '名场面', '泪目了', '太厉害了吧',
        '学到了', '收藏了', '催更', '下次一定', '爷青回',
        '破防了', '真的假的', '这也行', '绝了', 'awsl',
        '大佬带带我', '弹幕护体', '空降成功', '进度条君辛苦了', '字幕组辛苦了'
      ]
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        content: danmakuContents[Math.floor(Math.random() * danmakuContents.length)],
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${Math.floor(Math.random() * 100) + 1}`,
        videoId: Math.floor(Math.random() * 50) + 1,
        videoTitle: `视频标题 ${Math.floor(Math.random() * 50) + 1}`,
        color: ['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8', '#00cec9'][
          Math.floor(Math.random() * 7)
        ],
        position: Math.floor(Math.random() * 3),
        timePoint: Math.floor(Math.random() * 3600),
        fontSize: [14, 18, 24][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.05 ? 1 : 0,
        createTime: '2024-' + String(Math.floor(Math.random() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00:00'
      }))
      resolve({ code: 200, data: { list, total: 5000 }, message: 'success' })
    }, 500)
  })
}

export function deleteDanmaku(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function batchDeleteDanmaku(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function auditDanmaku(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function getDanmakuByVideo(videoId) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        content: `弹幕 ${i + 1}`,
        color: '#ffffff',
        position: 0,
        timePoint: i * 2,
        fontSize: 18
      }))
      resolve({ code: 200, data: list, message: 'success' })
    }, 300)
  })
}
