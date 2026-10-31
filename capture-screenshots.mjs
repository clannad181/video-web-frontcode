import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:5173'
const OUT = 'D:/ai/ai_coding/video-adminster/vue-front/docs/screenshots'

fs.mkdirSync(OUT, { recursive: true })

const svgCover = (title, c1, c2) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>` +
      `</linearGradient></defs>` +
      `<rect width="640" height="360" fill="url(#g)"/>` +
      `<text x="320" y="200" font-size="36" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${title}</text>` +
      `</svg>`
  )

const envelope = (data) => JSON.stringify({ code: 200, data })

const videoItems = [
  {
    id: 1, avid: 'avfree0001', videoUid: 'avfree0001',
    coverUrl: svgCover('免费观看', '#00a1d6', '#00546e'),
    title: '《深海纪元》正式PV 全站免费放送', nickName: '星辰影业',
    playCount: 1280000, favoriteCount: 32000, danmakuCount: 15200,
    totalDuration: 2760, createTime: '2026-10-12', needVip: false
  },
  {
    id: 2, avid: 'avvip00002', videoUid: 'avvip00002',
    coverUrl: svgCover('大会员专享', '#ff6699', '#b83280'),
    title: '《霓虹暗涌》全12集 大会员抢先看', nickName: '幻象工作室',
    playCount: 865000, favoriteCount: 45120, danmakuCount: 8800,
    totalDuration: 3000, createTime: '2026-10-15', needVip: true
  },
  {
    id: 3, avid: 'avvip00003', videoUid: 'avvip00003',
    coverUrl: svgCover('大会员独播', '#f7ba2a', '#c78a00'),
    title: '《山海遗城》纪录片 大会员独播', nickName: '见山纪实',
    playCount: 234000, favoriteCount: 12000, danmakuCount: 3400,
    totalDuration: 4520, createTime: '2026-10-09', needVip: true
  },
  {
    id: 4, avid: 'avfree0004', videoUid: 'avfree0004',
    coverUrl: svgCover('免费番剧', '#00b578', '#00724a'),
    title: '《午后车站》治愈系短篇合集', nickName: '轻声工作室',
    playCount: 156000, favoriteCount: 9800, danmakuCount: 2600,
    totalDuration: 1860, createTime: '2026-10-18', needVip: false
  }
]

const playDetail = {
  avid: 'avqf1hHM9eI8',
  id: 'avqf1hHM9eI8',
  uid: 'up001',
  title: '霓虹暗涌',
  nickName: '幻象工作室',
  descript: '赛博都市背景下的悬疑长篇，每周五更新。',
  createTime: '2026-10-15',
  coverUrl: svgCover('霓虹暗涌', '#ff6699', '#b83280'),
  avatarUrl: '',
  tags: ['赛博朋克', '悬疑', '国产动画'],
  isOngoing: true,
  episodeCount: 3,
  episodes: [
    {
      id: 'ep0001', avid: 'avqf2hzNzAAA', episodeNumber: 1,
      title: '第1集 雨夜来客', duration: 1420, needVip: false,
      playUrl: 'demo-ep1.mp4', playLink: '',
      playCount: 86000, likeCount: 5200, coinCount: 1200, favoriteCount: 3400
    },
    {
      id: 'ep0002', avid: 'avqf2hzNzPCE', episodeNumber: 2,
      title: '第2集 消失的信号塔', duration: 1380, needVip: true,
      playUrl: '', playLink: '',
      playCount: 42000, likeCount: 3100, coinCount: 800, favoriteCount: 2100
    },
    {
      id: 'ep0003', avid: 'avqf2hzNzXXX', episodeNumber: 3,
      title: '第3集 深夜追踪', duration: 1450, needVip: true,
      playUrl: '', playLink: '',
      playCount: 39000, likeCount: 2900, coinCount: 700, favoriteCount: 1900
    }
  ],
  currentEpisode: {
    id: 'ep0002', avid: 'avqf2hzNzPCE', episodeNumber: 2,
    title: '第2集 消失的信号塔', duration: 1380, needVip: true,
    playUrl: '', playLink: '',
    playCount: 42000, likeCount: 3100, coinCount: 800, favoriteCount: 2100
  }
}

const categories = [
  { id: 2, name: '番剧' },
  { id: 3, name: '国创' },
  { id: 4, name: '纪录片' },
  { id: 5, name: '影视' }
]

const profileDir = `${process.env.TEMP}\\opencode\\edge-shot-profile-${Date.now()}`
const edgeProc = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=9333',
    `--user-data-dir=${profileDir}`
  ],
  { detached: true, stdio: 'ignore' }
)
edgeProc.unref()

let wsEndpoint = null
for (let i = 0; i < 40 && !wsEndpoint; i++) {
  try {
    const r = await fetch('http://127.0.0.1:9333/json/version')
    wsEndpoint = (await r.json()).webSocketDebuggerUrl
  } catch {
    await new Promise((r) => setTimeout(r, 500))
  }
}
if (!wsEndpoint) {
  console.error('无法连接 Edge DevTools')
  process.exit(1)
}
const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })

const makePage = async (withAuth) => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  if (withAuth) {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('frontAccessToken', 'mock-token')
      localStorage.setItem(
        'frontUser',
        JSON.stringify({ uid: 'u001', nickname: '截图用户', avatarUrl: '' })
      )
    })
  }
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const url = req.url()
    // API 基址为跨域绝对地址（http://127.0.0.1:8899/api），响应需带 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
    if (req.method() === 'OPTIONS') {
      return req
        .respond({ status: 204, headers: corsHeaders })
        .catch(() => req.continue().catch(() => {}))
    }
    const ok = (data) =>
      req
        .respond({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: envelope(data)
        })
        .catch(() => req.continue().catch(() => {}))

    if (!url.includes('/api/')) return req.continue().catch(() => {})
    if (url.includes('/client/video/recommend')) {
      return ok({ banner: [videoItems[1], videoItems[0]], cards: videoItems.slice(0, 4) })
    }
    if (url.includes('/client/video/list')) {
      return ok({ records: videoItems, total: videoItems.length })
    }
    if (url.includes('/client/category/list')) {
      return ok(categories)
    }
    if (/\/api\/client\/video\/[^/]+\/episode\/[^/]+/.test(url)) {
      return ok(playDetail)
    }
    if (url.includes('/client/video/related')) {
      return ok({ records: [], total: 0 })
    }
    if (url.includes('/client/search')) {
      return ok({ records: videoItems, total: videoItems.length })
    }
    if (url.includes('/client/user/userInfo')) {
      return ok({ uid: 'u001', nickname: '截图用户', avatarUrl: '', isVip: false })
    }
    if (url.includes('/client/dict/')) {
      return ok([])
    }
    return req.continue()
  })
  return page
}

const shot = async (page, name, ms = 1600) => {
  await new Promise((r) => setTimeout(r, ms))
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('saved', name)
}

// 1. 首页（卡片 + 轮播大会员角标）
{
  const page = await makePage(false)
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle2' })
  await shot(page, 'home-vip-badge', 2500)
  await page.close()
}

// 2. 播放页（大会员锁定提示 + 选集丝带标签）
{
  const page = await makePage(false)
  await page.goto(`${BASE}/#/client/video/avqf1hHM9eI8/episode/avqf2hzNzPCE`, {
    waitUntil: 'networkidle2'
  })
  await shot(page, 'play-vip-lock', 2500)
  await page.close()
}

// 3. 搜索页（视频 tab 角标）
{
  const page = await makePage(true)
  await page.goto(`${BASE}/#/search?q=%E6%B7%B1%E6%B5%B7&type=video`, {
    waitUntil: 'networkidle2'
  })
  await shot(page, 'search-vip-badge', 2500)
  await page.close()
}

// 4. 投稿页剧集管理（大会员开关）
{
  const page = await makePage(true)
  await page.goto(`${BASE}/#/contribution`, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 1200))
  await page.click('.new-contribution-btn')
  await new Promise((r) => setTimeout(r, 800))
  await page.type('input[placeholder="请输入视频标题"]', '霓虹暗涌 第二季')
  await page.$eval('select.form-select', (el) => {
    el.value = '2'
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await new Promise((r) => setTimeout(r, 300))
  const nextBtn = await page.$$('.action-btn--primary')
  for (const btn of nextBtn) {
    const text = await btn.evaluate((el) => el.textContent.trim())
    if (text.includes('下一步')) {
      await btn.click()
      break
    }
  }
  await shot(page, 'submit-episode-vip-switch', 2000)
  await page.close()
}

await browser.disconnect()
try {
  spawn('taskkill', ['/PID', String(edgeProc.pid), '/T', '/F'], { stdio: 'ignore' })
} catch {}
console.log('done')
