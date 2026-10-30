// 生成 README 截图：启动 Vite 开发服务器 + 无头 Edge，
// 拦截后端接口返回演示数据，逐页截图到 docs/screenshots。
//
// 用法：node scripts/capture-screenshots.mjs
// 依赖：Edge（可用 EDGE_PATH 环境变量覆盖）、puppeteer-core（已内置）
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots')
const PORT = Number(process.env.SHOT_PORT || 5199)
const BASE = `http://localhost:${PORT}`
const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const API_HOST = '8899'

/* ---------------------------- 演示数据 ---------------------------- */

const svg = (s) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`

const cover = (c1, c2, label) => svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <circle cx="160" cy="90" r="26" fill="rgba(255,255,255,.9)"/>
  <path d="M152 76 L176 90 L152 104 Z" fill="${c1}"/>
  <text x="18" y="164" font-family="Segoe UI, sans-serif" font-size="15"
        fill="rgba(255,255,255,.95)" font-weight="600">${label}</text>
</svg>`)

const avatar = (letter, c1, c2) => svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="80" height="80" rx="40" fill="url(#a)"/>
  <text x="40" y="52" text-anchor="middle" font-family="Segoe UI, sans-serif"
        font-size="34" font-weight="700" fill="#fff">${letter}</text>
</svg>`)

const CATEGORIES = ['动画', '游戏', '科技', '生活', '音乐', '影视', '知识', '舞蹈']

const MENU_LIST = [
  { id: 1, menuName: '工作台', menuIdentification: 'Dashboard', icon: 'Odometer', category: 'MAIN', path: '/' },
  { id: 2, menuName: '数据分析', menuIdentification: 'DataAnalysis', icon: 'TrendCharts', category: 'MAIN' },
  { id: 3, menuName: '视频管理', menuIdentification: 'VideoManage', icon: 'VideoCamera', category: 'MAIN' },
  { id: 4, menuName: '人员管理', menuIdentification: 'UserManage', icon: 'User', category: 'MAIN' },
  { id: 5, menuName: '角色管理', menuIdentification: 'Role', icon: 'UserFilled', category: 'MAIN' },
  { id: 6, menuName: '菜单管理', menuIdentification: 'MenuManage', icon: 'Menu', category: 'MAIN' },
  { id: 7, menuName: '分类管理', menuIdentification: 'CategoryManage', icon: 'Folder', category: 'MAIN' },
  { id: 8, menuName: '字典管理', menuIdentification: 'DictManage', icon: 'Collection', category: 'MAIN' },
  { id: 9, menuName: '评论管理', menuIdentification: 'CommentManage', icon: 'ChatDotRound', category: 'MAIN' },
  {
    id: 10, menuName: '内容审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck', category: 'MAIN',
    children: [
      { id: 101, menuName: '稿件审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck' },
      { id: 102, menuName: '稿件投诉', menuIdentification: 'ReviewComplaint', icon: 'Warning' }
    ]
  },
  {
    id: 11, menuName: '系统设置', menuIdentification: 'Settings', icon: 'Setting', category: 'SYS',
    children: [
      { id: 111, menuName: '网站设置', menuIdentification: 'Settings', icon: 'Monitor' },
      { id: 112, menuName: '通知设置', menuIdentification: 'Notice', icon: 'Bell' }
    ]
  },
  { id: 12, menuName: '系统信息', menuIdentification: 'SystemInfo', icon: 'Monitor', category: 'SYS' },
  {
    id: 13, menuName: '系统日志', menuIdentification: 'SystemLog', icon: 'Document', category: 'SYS',
    children: [
      { id: 131, menuName: '登录日志', menuIdentification: 'LoginLog', icon: 'Key' },
      { id: 132, menuName: '运行日志', menuIdentification: 'OperationLog', icon: 'Cpu' },
      { id: 133, menuName: '日志统计', menuIdentification: 'LogStatistics', icon: 'DataAnalysis' }
    ]
  }
]

const USER_INFO = {
  id: 1, name: 'admin', userName: 'admin', nickName: '超级管理员', nikeName: '超级管理员',
  email: 'admin@video-admin.com', avatar: avatar('A', '#fb7299', '#ff9ac6'),
  roleId: 1, roleName: '超级管理员', roleLevel: 0, status: 1, menuList: MENU_LIST
}

const VIDEO_ROWS = [
  { id: 1, avid: 'av100001', title: 'Vue 3 组合式 API 从入门到实战', totalDuration: 4820, episodeCount: 12, playCount: 1284000, favoriteCount: 92300, categoryName: '科技', nickName: '前端小王', uid: 'u10001', isOngoing: true, videoStatus: 2, reviewStatus: 2, createTime: '2026-10-21 10:12:00' },
  { id: 2, avid: 'av100002', title: '原神 5.2 版本全地图探索攻略', totalDuration: 7260, episodeCount: 8, playCount: 2361000, favoriteCount: 154200, categoryName: '游戏', nickName: '旅行者阿May', uid: 'u10002', isOngoing: true, videoStatus: 2, reviewStatus: 2, createTime: '2026-10-20 18:30:00' },
  { id: 3, avid: 'av100003', title: '十分钟学会做番茄牛腩', totalDuration: 660, episodeCount: 1, playCount: 456000, favoriteCount: 38100, categoryName: '生活', nickName: '厨房日记', uid: 'u10003', isOngoing: false, videoStatus: 2, reviewStatus: 2, createTime: '2026-10-20 12:05:00' },
  { id: 4, avid: 'av100004', title: '【4K】十月新番混剪 AMV', totalDuration: 240, episodeCount: 1, playCount: 890200, favoriteCount: 66200, categoryName: '动画', nickName: '剪辑师Lin', uid: 'u10004', isOngoing: false, videoStatus: 2, reviewStatus: 1, createTime: '2026-10-19 21:40:00' },
  { id: 5, avid: 'av100005', title: '钢琴即兴｜雨夜的城市', totalDuration: 480, episodeCount: 1, playCount: 213000, favoriteCount: 19800, categoryName: '音乐', nickName: '琴键之上', uid: 'u10005', isOngoing: false, videoStatus: 1, reviewStatus: 2, createTime: '2026-10-19 09:18:00' },
  { id: 6, avid: 'av100006', title: '深度学习入门：从感知机到 Transformer', totalDuration: 5400, episodeCount: 6, playCount: 672000, favoriteCount: 88400, categoryName: '知识', nickName: 'AI 研究员老周', uid: 'u10006', isOngoing: true, videoStatus: 2, reviewStatus: 2, createTime: '2026-10-18 15:22:00' },
  { id: 7, avid: 'av100007', title: '电影《星际回声》深度解说', totalDuration: 1320, episodeCount: 1, playCount: 1520000, favoriteCount: 121000, categoryName: '影视', nickName: '光影说', uid: 'u10007', isOngoing: false, videoStatus: 2, reviewStatus: 2, createTime: '2026-10-18 11:02:00' },
  { id: 8, avid: 'av100008', title: '街舞基础律动教学 第一节', totalDuration: 900, episodeCount: 4, playCount: 98000, favoriteCount: 7600, categoryName: '舞蹈', nickName: 'Bboy 阿哲', uid: 'u10008', isOngoing: true, videoStatus: 3, reviewStatus: 1, createTime: '2026-10-17 20:45:00' }
].map((v, i) => ({
  ...v,
  coverUrl: cover(['#5b8cff', '#8f5bff', '#ff6fa5', '#4ecdc4', '#ffb74d', '#7c5cfc', '#20c997', '#ff8a80'][i],
    ['#8f5bff', '#4ecdc4', '#ff9ac6', '#5b8cff', '#ff6b6b', '#5b8cff', '#1ecf54', '#ffb74d'][i],
    v.title),
  avatarUrl: avatar(v.nickName[0], '#fb7299', '#7c5cfc')
}))

const ROLE_NAME = { 1: '超级管理员', 2: '运营管理员', 3: '内容审核员', 4: '普通用户', 5: '大会员' }

const USERS = [
  { id: 1, userName: 'admin', nikeName: '超级管理员', email: 'admin@video-admin.com', status: 0, type: 1, roleId: 1, roleLevel: 0, createTime: '2026-01-01 09:00:00' },
  { id: 2, userName: 'operator', nikeName: '运营小张', email: 'zhang@video-admin.com', status: 0, type: 1, roleId: 2, roleLevel: 2, createTime: '2026-02-14 10:20:00' },
  { id: 3, userName: 'auditor01', nikeName: '审核员李姐', email: 'li@video-admin.com', status: 0, type: 1, roleId: 3, roleLevel: 3, createTime: '2026-03-03 14:08:00' },
  { id: 4, userName: 'uploader_wang', nikeName: '前端小王', email: 'wang@video-admin.com', status: 0, type: 0, roleId: 4, roleLevel: 5, createTime: '2026-04-11 08:45:00' },
  { id: 5, userName: 'traveler_may', nikeName: '旅行者阿May', email: 'may@video-admin.com', status: 0, type: 0, roleId: 4, roleLevel: 5, createTime: '2026-04-12 16:30:00' },
  { id: 6, userName: 'kitchen_diary', nikeName: '厨房日记', email: 'cook@video-admin.com', status: 1, type: 0, roleId: 4, roleLevel: 5, createTime: '2026-05-06 11:12:00' },
  { id: 7, userName: 'ai_zhou', nikeName: 'AI 研究员老周', email: 'zhou@video-admin.com', status: 0, type: 0, roleId: 4, roleLevel: 5, createTime: '2026-06-19 19:25:00' },
  { id: 8, userName: 'light_say', nikeName: '光影说', email: 'light@video-admin.com', status: 0, type: 0, roleId: 4, roleLevel: 5, createTime: '2026-07-02 10:40:00' }
].map((u, i) => ({
  ...u,
  roleName: ROLE_NAME[u.roleId],
  avatar: avatar(u.nikeName[0], ['#fb7299', '#5b8cff', '#4ecdc4', '#ffb74d', '#7c5cfc', '#ff6b6b', '#20c997', '#8f5bff'][i], '#ff9ac6'),
  isVip: i % 3 === 0 ? 1 : 0, sex: i % 2 === 0, descript: ''
}))

function paged(rows, query = '') {
  const p = new URLSearchParams(query)
  const page = Number(p.get('page') || 1)
  const size = Number(p.get('size') || 10)
  return { records: rows.slice((page - 1) * size, page * size), total: rows.length, size, current: page }
}

const ROLES = [
  { id: 1, name: '超级管理员', description: '拥有系统全部权限', level: 1, status: 1, sysDef: 1, createUserName: 'system', createUserNickname: '系统', createTime: '2026-01-01 09:00:00' },
  { id: 2, name: '运营管理员', description: '负责内容运营、用户与视频管理', level: 2, status: 1, sysDef: 0, createUserName: 'admin', createUserNickname: '超级管理员', createTime: '2026-02-10 10:00:00' },
  { id: 3, name: '内容审核员', description: '负责稿件与评论审核', level: 3, status: 1, sysDef: 0, createUserName: 'admin', createUserNickname: '超级管理员', createTime: '2026-02-12 11:30:00' },
  { id: 4, name: '普通用户', description: '前台普通用户默认角色', level: 5, status: 1, sysDef: 1, createUserName: 'system', createUserNickname: '系统', createTime: '2026-01-01 09:05:00' },
  { id: 5, name: '大会员', description: '拥有大会员权益的前台用户', level: 4, status: 1, sysDef: 0, createUserName: 'admin', createUserNickname: '超级管理员', createTime: '2026-03-08 15:22:00' },
  { id: 6, name: '数据分析师', description: '只读访问数据分析与日志', level: 3, status: 0, sysDef: 0, createUserName: 'admin', createUserNickname: '超级管理员', createTime: '2026-05-20 09:45:00' }
]

const MENUS_FLAT = [
  { id: 1, parentId: 0, menuName: '工作台', icon: 'Odometer', menuIdentification: 'Dashboard', descSort: 1, status: 1, category: 'MAIN' },
  { id: 2, parentId: 0, menuName: '数据分析', icon: 'TrendCharts', menuIdentification: 'DataAnalysis', descSort: 2, status: 1, category: 'MAIN' },
  { id: 3, parentId: 0, menuName: '视频管理', icon: 'VideoCamera', menuIdentification: 'VideoManage', descSort: 3, status: 1, category: 'MAIN' },
  { id: 4, parentId: 0, menuName: '人员管理', icon: 'User', menuIdentification: 'UserManage', descSort: 4, status: 1, category: 'MAIN' },
  { id: 5, parentId: 0, menuName: '角色管理', icon: 'UserFilled', menuIdentification: 'Role', descSort: 5, status: 1, category: 'MAIN' },
  { id: 6, parentId: 0, menuName: '菜单管理', icon: 'Menu', menuIdentification: 'MenuManage', descSort: 6, status: 1, category: 'MAIN' },
  { id: 7, parentId: 0, menuName: '分类管理', icon: 'Folder', menuIdentification: 'CategoryManage', descSort: 7, status: 1, category: 'MAIN' },
  { id: 8, parentId: 0, menuName: '评论管理', icon: 'ChatDotRound', menuIdentification: 'CommentManage', descSort: 8, status: 1, category: 'MAIN' },
  { id: 9, parentId: 0, menuName: '内容审核', icon: 'CircleCheck', menuIdentification: 'ReviewManage', descSort: 9, status: 1, category: 'MAIN' },
  { id: 10, parentId: 9, menuName: '稿件审核', icon: 'CircleCheck', menuIdentification: 'ReviewManage', descSort: 1, status: 1, category: 'MAIN' },
  { id: 11, parentId: 9, menuName: '稿件投诉', icon: 'Warning', menuIdentification: 'ReviewComplaint', descSort: 2, status: 1, category: 'MAIN' },
  { id: 12, parentId: 0, menuName: '系统设置', icon: 'Setting', menuIdentification: 'Settings', descSort: 10, status: 1, category: 'SYS' },
  { id: 13, parentId: 12, menuName: '网站设置', icon: 'Monitor', menuIdentification: 'Settings', descSort: 1, status: 1, category: 'SYS' },
  { id: 14, parentId: 12, menuName: '通知设置', icon: 'Bell', menuIdentification: 'Notice', descSort: 2, status: 1, category: 'SYS' },
  { id: 15, parentId: 0, menuName: '系统日志', icon: 'Document', menuIdentification: 'SystemLog', descSort: 11, status: 1, category: 'SYS' },
  { id: 16, parentId: 15, menuName: '登录日志', icon: 'Key', menuIdentification: 'LoginLog', descSort: 1, status: 1, category: 'SYS' },
  { id: 17, parentId: 15, menuName: '运行日志', icon: 'Cpu', menuIdentification: 'OperationLog', descSort: 2, status: 1, category: 'SYS' }
]

const CATEGORY_ROWS = CATEGORIES.map((name, i) => ({
  id: i + 1, name, sort: i + 1, isShow: 1, isSystem: i < 2 ? 1 : 0,
  status: i === 7 ? 0 : 1, createTime: `2026-0${(i % 9) + 1}-12 10:0${i}:00`
}))

const COMMENTS = [
  { id: 1, content: '这期讲得太清楚了，组合式 API 终于理解了！', nickName: '前端小王', videoTitle: 'Vue 3 组合式 API 从入门到实战', likeCount: 328, replyCount: 12, status: 0, createTime: '2026-10-21 12:30:00' },
  { id: 2, content: '这套打法太稳了，深渊满星达成 🙏', nickName: '旅行者阿May', videoTitle: '原神 5.2 版本全地图探索攻略', likeCount: 1024, replyCount: 86, status: 0, createTime: '2026-10-21 11:15:00' },
  { id: 3, content: '番茄牛腩按这个比例做出来真的很香', nickName: '厨房日记', videoTitle: '十分钟学会做番茄牛腩', likeCount: 512, replyCount: 27, status: 0, createTime: '2026-10-20 20:08:00' },
  { id: 4, content: '剪辑节奏绝了，BGM 是什么名字？', nickName: '剪辑师Lin', videoTitle: '【4K】十月新番混剪 AMV', likeCount: 231, replyCount: 9, status: 1, createTime: '2026-10-20 19:44:00' },
  { id: 5, content: '这段旋律让我想起雨夜的街道', nickName: '琴键之上', videoTitle: '钢琴即兴｜雨夜的城市', likeCount: 187, replyCount: 5, status: 0, createTime: '2026-10-19 22:31:00' },
  { id: 6, content: '讲得比论文好懂多了，收藏了慢慢看', nickName: 'AI 研究员老周', videoTitle: '深度学习入门：从感知机到 Transformer', likeCount: 674, replyCount: 41, status: 0, createTime: '2026-10-19 18:02:00' },
  { id: 7, content: '星际回声的反转确实没想到', nickName: '光影说', videoTitle: '电影《星际回声》深度解说', likeCount: 892, replyCount: 63, status: 2, createTime: '2026-10-18 21:20:00' }
].map((c, i) => ({
  ...c,
  avatar: avatar(c.nickName[0], ['#fb7299', '#5b8cff', '#4ecdc4', '#ffb74d', '#7c5cfc'][i % 5], '#8f5bff'),
  userId: i + 10, videoId: i + 1,
  videoCover: VIDEO_ROWS[i % VIDEO_ROWS.length].coverUrl
}))

const LOGIN_LOGS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  account: ['admin', 'operator', 'auditor01', 'uploader_wang'][i % 4],
  loginType: i % 2 ? 'email_captcha' : 'img_captcha',
  systemType: i % 3 === 0 ? 0 : 0,
  ipAddress: `192.168.1.${20 + i}`,
  loginStatus: i === 5 ? 0 : 1,
  failReason: i === 5 ? '验证码错误' : '',
  loginTime: `2026-10-2${(i % 9) + 1} 0${i % 9 + 1}:${String(i * 7).padStart(2, '0')}:00`
}))

const OPERATION_LOGS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  username: ['admin', 'operator', 'auditor01'][i % 3],
  module: ['视频管理', '人员管理', '内容审核', '系统设置'][i % 4],
  operationDesc: ['新增视频', '修改用户信息', '审核通过稿件', '更新网站设置'][i % 4],
  requestUri: ['/api/admin/video/add', '/api/admin/user/update', '/api/admin/video/review', '/api/admin/config/update'][i % 4],
  requestMethod: ['POST', 'POST', 'POST', 'POST'][i % 4],
  ipAddress: `192.168.1.${30 + i}`,
  executionTime: 12 + i * 7,
  resultStatus: 1,
  operationTime: `2026-10-2${(i % 9) + 1} 1${i % 9}:${String(i * 5).padStart(2, '0')}:00`
}))

const SYSTEM_INFO = {
  javaVersion: '17.0.11', javaVendor: 'Eclipse Adoptium',
  osName: 'Windows Server 2022', osArch: 'amd64',
  jvmStartTime: '2026-10-28 08:12:31',
  cpuCores: 8, systemCpuLoad: 23.4, processCpuLoad: 11.2,
  systemMemoryUsage: 46.8, systemUsedMemory: 7360, systemTotalMemory: 16384,
  heapUsage: 32.5, heapUsed: 2080, heapMax: 4096, nonHeapUsed: 256,
  threadCount: 86, peakThreadCount: 124, daemonThreadCount: 42,
  diskInfoList: [
    { name: '系统盘', mount: 'C:', type: 'NTFS', used: 128, free: 384, total: 512 },
    { name: '数据盘', mount: 'D:', type: 'NTFS', used: 620, free: 1404, total: 2024 }
  ]
}

const CONFIG_LIST = [
  { key: 'siteName', value: 'Video Admin' },
  { key: 'siteDesc', value: '一站式视频内容管理与运营平台' },
  { key: 'siteUrl', value: 'https://video-admin.com' },
  { key: 'language', value: 'zh-CN' },
  { key: 'timezone', value: 'Asia/Shanghai' },
  { key: 'primaryColor', value: '#fb7299' },
  { key: 'darkMode', value: 'false' },
  { key: 'compactMode', value: 'false' },
  { key: 'sidebarStyle', value: 'dark' },
  { key: 'video_review', value: 'true' },
  { key: 'comment_review', value: 'true' },
  { key: 'sensitive_word_filter', value: 'true' },
  { key: 'loginNotify', value: 'true' },
  { key: 'sessionTimeout', value: '30' },
  { key: 'default_password', value: '123456' },
  { key: 'videoReviewNotify', value: 'true' },
  { key: 'commentNotify', value: 'true' },
  { key: 'reportNotify', value: 'false' }
]

/* ---------------------------- 接口 mock ---------------------------- */

const trend = (n, fn) => Array.from({ length: n }, (_, i) => {
  const d = new Date(2026, 9, 21 + i)
  return { date: `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`, ...fn(i) }
})

function mockBody(url) {
  const u = new URL(url)
  const p = u.pathname.replace(/^\/api/, '')
  const q = u.search.slice(1)

  if (p.includes('/admin/user/userInfo')) return { code: 200, data: USER_INFO }
  if (p.includes('/admin/user/captcha')) return { code: 200, data: { key: 'k1', image: '' } }
  if (p.includes('/admin/system/info')) return { code: 200, data: SYSTEM_INFO }
  if (p.includes('/admin/config/list')) return { code: 200, data: CONFIG_LIST }

  if (p.includes('/admin/video/review-stats')) {
    return {
      code: 200, data: {
        pendingCount: 12, partialCount: 5, pendingPublishCount: 3,
        todayNewCount: 45, todayNewDiff: 12.5,
        todayPendingCount: 20, todayPendingDiff: -5.2
      }
    }
  }
  if (p.includes('/admin/comment/status-stats')) return { code: 200, data: { pendingReviewCount: 8 } }

  if (p.includes('/admin/stats/overview')) {
    return {
      code: 200, data: {
        totalVideoCount: 12345, totalPlayCount: 98765432, todayActiveUsers: 8923,
        totalCommentCount: 234567, todayNewVideos: 45, todayPlayCount: 234567,
        todayNewComments: 567, todayLoginCount: 1567
      }
    }
  }
  if (p.includes('/admin/stats/active-users')) {
    return { code: 200, data: trend(7, i => ({ activeUsers: 3200 + i * 210, activeCount: 3200 + i * 210 })) }
  }
  if (p.includes('/admin/stats/daily-increment')) {
    return { code: 200, data: trend(7, i => ({ videoCount: 38 + i * 3, commentCount: 420 + i * 35, playCount: 82000 + i * 9000 })) }
  }
  if (p.includes('/admin/stats/category-daily-increment')) {
    return {
      code: 200, data: trend(7, i => {
        const row = {}
        CATEGORIES.slice(0, 5).forEach((c, j) => { row[c] = 12 + ((i * 3 + j * 7) % 26) })
        return row
      })
    }
  }
  if (p.includes('/admin/video/category-stats')) {
    return { code: 200, data: CATEGORIES.map((name, i) => ({ name, value: 3400 - i * 380 })) }
  }
  if (p.includes('/admin/operationLog/hourlyActive')) {
    return { code: 200, data: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, activeCount: Math.round(320 + 480 * Math.sin((h - 6) / 24 * Math.PI * 2)) + 60 })) }
  }

  if (p.includes('/admin/category/list')) return { code: 200, data: paged(CATEGORY_ROWS, q) }
  if (p.includes('/admin/category/enabled')) return { code: 200, data: CATEGORY_ROWS.filter(c => c.status) }
  if (p.includes('/admin/video/list')) return { code: 200, data: paged(VIDEO_ROWS, q) }
  if (p.includes('/admin/user/list')) {
    const tabType = new URLSearchParams(q).get('type')
    const rows = tabType === '0'
      ? USERS.filter(u => u.type === 0)
      : USERS.filter(u => u.type === 1)
    return { code: 200, data: paged(rows, q) }
  }
  if (p.includes('/admin/role/list')) return { code: 200, data: paged(ROLES, q) }
  if (p.includes('/admin/role/getBindMenuIds')) return { code: 200, data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] }
  if (p.includes('/admin/menu/options')) return { code: 200, data: MENUS_FLAT.filter(m => m.parentId === 0) }
  if (p.includes('/admin/menu/list')) return { code: 200, data: paged(MENUS_FLAT, q) }
  if (p.includes('/admin/comment/list')) return { code: 200, data: paged(COMMENTS, q) }
  if (p.includes('/admin/comment/review-list')) return { code: 200, data: paged(COMMENTS, q) }
  if (p.includes('/admin/video/review-list')) return { code: 200, data: paged(VIDEO_ROWS, q) }
  if (p.includes('/admin/loginLog/list')) return { code: 200, data: paged(LOGIN_LOGS, q) }
  if (p.includes('/admin/operationLog/list')) return { code: 200, data: paged(OPERATION_LOGS, q) }
  if (p.includes('/admin/loginLog/trend')) {
    return { code: 200, data: trend(7, i => ({ count: 1200 + i * 90, successCount: 1150 + i * 88, failCount: 50 + i })) }
  }
  if (p.includes('/admin/operationLog/trend')) {
    return { code: 200, data: trend(7, i => ({ count: 860 + i * 60 })) }
  }
  if (p.includes('/admin/operationLog/accountRank')) {
    return { code: 200, data: [{ name: 'admin', value: 420 }, { name: 'operator', value: 316 }, { name: 'auditor01', value: 208 }] }
  }
  if (p.includes('/admin/operationLog/ipRank')) {
    return { code: 200, data: [{ name: '192.168.1.20', value: 280 }, { name: '192.168.1.31', value: 190 }, { name: '192.168.1.42', value: 120 }] }
  }
  if (/\/admin\/video\/\d+$/.test(p)) {
    return {
      code: 200, data: {
        ...VIDEO_ROWS[0], description: '本片带大家从零开始理解组合式 API 的设计思想与实战技巧。',
        tags: ['前端', 'Vue3', '实战'], likeCount: 56000, coinCount: 21000,
        episodes: [
          { id: 1, episodeNumber: 1, title: '响应式基础', duration: 620, playUrl: '', reviewStatus: 2, sortOrder: 1 },
          { id: 2, episodeNumber: 2, title: 'computed 与 watch', duration: 780, playUrl: '', reviewStatus: 2, sortOrder: 2 },
          { id: 3, episodeNumber: 3, title: '组合式函数复用', duration: 900, playUrl: '', reviewStatus: 2, sortOrder: 3 }
        ]
      }
    }
  }

  if (p.includes('/admin/dict/data/enabled/')) {
    const typeCode = p.split('/admin/dict/data/enabled/')[1]
    return { code: 200, data: DICT_DATA[typeCode] || [] }
  }
  if (p.includes('/admin/dict/type/list') || p.includes('/admin/dict/data/list')) {
    return { code: 200, data: paged([], q) }
  }

  return { code: 200, data: paged([], q) }
}

/* ---------------------------- 页面清单 ---------------------------- */

const PAGES = [
  { file: 'login', path: '/#/login', noAuth: true, fullPage: false, wait: 1200 },
  { file: 'dashboard', path: '/#/dashboard', wait: 1600 },
  { file: 'analytics', path: '/#/data-analysis', wait: 2200 },
  { file: 'video-manage', path: '/#/video-manage', wait: 1600 },
  { file: 'user-manage', path: '/#/users', wait: 1400 },
  { file: 'comment-manage', path: '/#/comment-manage', wait: 1400 },
  { file: 'review', path: '/#/review', wait: 1600 },
  { file: 'category-manage', path: '/#/category-manage', wait: 1400 },
  { file: 'role-manage', path: '/#/roles', wait: 1400 },
  { file: 'menu-manage', path: '/#/menus', wait: 1400 },
  { file: 'system-info', path: '/#/system-info', wait: 1600 },
  { file: 'login-log', path: '/#/login-log', wait: 1400 },
  { file: 'operation-log', path: '/#/operation-log', wait: 1400 },
  { file: 'settings', path: '/#/settings', wait: 1600 },
  { file: 'profile', path: '/#/profile', wait: 1400 },
  { file: 'dashboard-dark', path: '/#/dashboard', wait: 1800, dark: true }
]

/* ---------------------------- 运行 ---------------------------- */

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const DEBUG_PORT = Number(process.env.SHOT_DEBUG_PORT || 9334)

async function connectEdge() {
  // 注意：Windows 下 Edge 的 user-data-dir 不要放在含中文的用户目录，否则可能直接退出。
  const profile = process.platform === 'win32'
    ? 'C:\\temp\\pptr-readme-shots'
    : path.join(process.env.TMPDIR || '/tmp', 'pptr-readme-shots')
  // Edge 在 Windows 上会 detach 出独立进程，直接 puppeteer.launch 会误判为启动失败，
  // 因此手动拉起并带 remote-debugging-port，再通过 browserURL 连接。
  const child = spawn(EDGE, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,900',
    'about:blank'
  ], { detached: true, stdio: 'ignore' })
  child.unref()

  const start = Date.now()
  while (Date.now() - start < 30000) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`, { signal: AbortSignal.timeout(1500) })
      if (res.ok) {
        return await puppeteer.connect({
          browserURL: `http://127.0.0.1:${DEBUG_PORT}`,
          defaultViewport: null
        })
      }
    } catch { }
    await sleep(300)
  }
  throw new Error('连接 Edge DevTools 超时')
}

async function waitServer(url, timeout = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch { }
    await sleep(500)
  }
  throw new Error(`开发服务器启动超时：${url}`)
}

async function startServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(1500) })
    if (res.ok) return null
  } catch { }
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'dev', '--', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore', shell: process.platform === 'win32' })
  await waitServer(BASE)
  return child
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin,refresh-token,cache-control'
}

const DICT_DATA = {
  video_status: [
    { label: '草稿', value: 0 }, { label: '待发布', value: 1 },
    { label: '已发布', value: 2 }, { label: '已下架', value: 3 }
  ],
  video_serialization_status: [{ label: '连载中', value: 1 }, { label: '已完结', value: 0 }],
  user_status: [{ label: '启用', value: 0 }, { label: '禁用', value: 1 }],
  category_status: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }],
  menu_status: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }],
  role_status: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }],
  comments_status: [
    { label: '正常', value: 0 }, { label: '审核中', value: 1 },
    { label: '已屏蔽', value: 2 }
  ]
}

async function main() {
  if (!existsSync(EDGE)) throw new Error(`未找到 Edge：${EDGE}，可通过 EDGE_PATH 指定浏览器路径`)
  // 仅全量出图时清空目录；SHOT_ONLY 只覆盖指定页面
  if (!process.env.SHOT_ONLY) {
    await rm(OUT_DIR, { recursive: true, force: true })
  }
  await mkdir(OUT_DIR, { recursive: true })

  const server = await startServer()
  const browser = await connectEdge()

  try {
    for (const shot of PAGES) {
      if (process.env.SHOT_ONLY && !process.env.SHOT_ONLY.split(',').includes(shot.file)) continue
      const page = await browser.newPage()
      const vw = shot.width || 1600
      const vh = shot.height || 1000
      await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 })
      await page.setRequestInterception(true)
      if (process.env.SHOT_DEBUG) {
        page.on('requestfailed', (r) => console.log('  ✗ requestfailed', r.url(), r.failure()?.errorText))
        page.on('response', (res) => { if (res.status() >= 400) console.log('  ✗ http', res.status(), res.url()) })
        page.on('console', (m) => { if (m.type() === 'error') console.log('  console:', m.text()) })
      }
      page.on('request', (req) => {
        const url = req.url()
        if (!url.includes(API_HOST)) return req.continue().catch(() => { })
        if (req.method() === 'OPTIONS') {
          const requested = req.headers()['access-control-request-headers']
          const allowHeaders = requested || CORS['access-control-allow-headers']
          return req.respond({
            status: 204,
            headers: { ...CORS, 'access-control-allow-headers': allowHeaders, 'content-length': '0' }
          }).catch(() => { })
        }
        const body = JSON.stringify(mockBody(url))
        const requested = req.headers()['access-control-request-headers']
        const allowHeaders = requested || CORS['access-control-allow-headers']
        return req.respond({
          status: 200,
          contentType: 'application/json;charset=utf-8',
          headers: { ...CORS, 'access-control-allow-headers': allowHeaders },
          body
        }).catch(() => { })
      })

      if (!shot.noAuth) {
        await page.evaluateOnNewDocument((userInfo, dark) => {
          localStorage.setItem('language', 'zh-cn')
          localStorage.setItem('accessToken', 'demo-token')
          localStorage.setItem('refreshToken', 'demo-refresh')
          localStorage.setItem('user', JSON.stringify({ id: 1, name: 'admin', userName: 'admin', roleLevel: 0, roleName: '超级管理员' }))
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          localStorage.setItem('darkMode', dark ? 'true' : 'false')
          localStorage.setItem('siteName', 'Video Admin')
        }, USER_INFO, !!shot.dark)
      } else {
        await page.evaluateOnNewDocument(() => {
          localStorage.clear()
          localStorage.setItem('language', 'zh-cn')
        })
      }

      const target = BASE + shot.path
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 })
      // 隐藏开发工具挂件与进度条，避免出现在截图里
      await page.addStyleTag({
        content: '#__vue-devtools-container__, #vue-inspector-container, .vue-devtools__anchor, #nprogress { display: none !important; }'
      })
      await sleep(shot.wait)
      // 等待图表/过渡动画稳定
      await sleep(600)
      const file = path.join(OUT_DIR, `${shot.file}.png`)
      await page.screenshot({ path: file, fullPage: shot.fullPage === true, captureBeyondViewport: shot.fullPage === true })
      console.log(`✓ ${shot.file}.png`)
      await page.close()
    }
  } finally {
    await browser.close().catch(() => { })
    if (server) server.kill()
  }

  console.log(`\n截图已输出到：${path.relative(ROOT, OUT_DIR)}`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
