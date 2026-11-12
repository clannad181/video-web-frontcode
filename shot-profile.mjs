// 临时截图脚本：mock /api 响应，展示登录态下的「我的」页面（截图后可删）
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

function pickBrowser() {
  if (process.env.BROWSER_PATH && fs.existsSync(process.env.BROWSER_PATH)) return process.env.BROWSER_PATH
  const pwRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (fs.existsSync(pwRoot)) {
    for (const d of fs.readdirSync(pwRoot).filter(x => x.startsWith('chromium'))) {
      for (const sub of ['chrome-win64', 'chrome-win']) {
        const p = path.join(pwRoot, d, sub, 'chrome.exe')
        if (fs.existsSync(p)) return p
      }
    }
  }
  return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
}
const EDGE = pickBrowser()
const BASE = 'http://localhost:5175'
const OUT = process.argv[2] || 'D:/ai/ai_coding/video-adminster/vue-front-mobile/docs/mobile-audit/profile-new.png'

const user = {
  uid: 'u001',
  nikeName: '移动端用户',
  descript: '这个人很懒，什么都没留下',
  isVip: true,
  avatar: ''
}

const cats = [
  { id: 101, name: '动画' }, { id: 102, name: '音乐' }, { id: 103, name: '舞蹈' },
  { id: 104, name: '游戏' }, { id: 105, name: '科技' }, { id: 106, name: '生活' },
  { id: 107, name: '鬼畜' }, { id: 108, name: '时尚' }, { id: 109, name: '娱乐' },
  { id: 110, name: '影视' }, { id: 111, name: '纪录片' }, { id: 112, name: '演唱会' }
]

const mkVideos = (n, tag) => Array.from({ length: n }, (_, i) => ({
  id: `${tag}-${i}`,
  avid: `av${tag}${i}`,
  title: `${tag}示例标题 ${i + 1}：这是一段用于版式验收的较长视频标题`,
  coverUrl: `https://picsum.photos/seed/${tag}${i}/320/200`,
  playCount: 1234 + i * 567,
  favoriteCount: 10 + i * 3,
  totalDuration: 60 + i * 37,
  needVip: i % 3 === 0,
  nickName: '移动端用户',
  createTime: '2026-11-01'
}))

const mkUsers = (n, tag) => Array.from({ length: n }, (_, i) => ({
  uid: `${tag}${i}`,
  nickName: `${tag}UP主 ${i + 1}`,
  descript: '这个人很懒，什么都没留下',
  avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(tag)}${i}/80/80`
}))

// 观看历史接口的真实字段（videoTitle / videoCover / watchTime / watchedTime）
const mkHistory = (n, tag) => Array.from({ length: n }, (_, i) => ({
  videoAvid: `av-${tag}-${i}`,
  videoTitle: `历史视频 ${i + 1}：这是一段用于版式验收的较长视频标题`,
  videoCover: `https://picsum.photos/seed/h${tag.replace(/-/g, '')}${i}/320/200`,
  nickName: '移动端用户',
  avatarUrl: '',
  episodeAvid: `ep-${tag}-${i}`,
  episodeTitle: '第1集',
  episodeNumber: 1,
  watchedSeconds: 60 + i * 37,
  watchedTime: `${12 + i}:${String(35 + i).padStart(2, '0')}`,
  playLink: `/client/video/av-${tag}-${i}/episode/ep-${tag}-${i}`,
  watchTime: `${tag} 10:0${i}:00`
}))

// 收藏接口的真实字段（videoTitle / videoCover / duration / episodeAvid）
const mkFavVideos = (n, tag) => Array.from({ length: n }, (_, i) => ({
  episodeAvid: `ep-${tag}-${i}`,
  videoAvid: `av-${tag}-${i}`,
  videoTitle: `${tag}收藏的视频 ${i + 1}：这是一段用于版式验收的较长视频标题`,
  videoCover: `https://picsum.photos/seed/${tag}${i}/320/200`,
  duration: 60 + i * 37,
  playCount: 1234 + i * 567,
  favoriteCount: 10 + i * 3,
  needVip: i % 3 === 0,
  nickName: '移动端用户',
  favoriteTime: '2026-11-01'
}))

// 播放页 /client/video/:uid/episode/:eid
const mkPlayVideo = () => ({
  id: 1,
  avid: 'av1',
  uid: 1001,
  title: '播放页验收示例视频：这是一段用于版式验收的较长视频标题',
  coverUrl: 'https://picsum.photos/seed/play/640/360',
  desc: '这是一段用于版式验收的视频简介，用于确认播放页的信息排版。',
  playCount: 12345,
  favoriteCount: 999,
  coinCount: 120,
  nickName: '移动端用户',
  avatarUrl: '',
  createTime: '2026-11-01',
  duration: 300,
  needVip: false,
  episodes: [{ id: 1, avid: 'ep1', episodeNumber: 1, title: '第1集', playUrl: '' }],
  currentEpisode: { id: 1, avid: 'ep1', episodeNumber: 1, title: '第1集', playUrl: '' }
})

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.evaluateOnNewDocument(() => {
  localStorage.setItem('frontAccessToken', 'mock-token')
  localStorage.setItem('frontUser', JSON.stringify({ uid: 'u001', nickname: '移动端用户', avatarUrl: '' }))
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console:' + m.text().slice(0, 160)) })
page.on('requestfailed', (r) => errors.push('reqfail:' + r.url().slice(0, 120) + ' ' + (r.failure()?.errorText || '')))
await page.setRequestInterception(true)
page.on('request', (req) => {
  const url = req.url()
  const isApi = new URL(url).pathname.startsWith('/api/')
  if (isApi) {
    const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }
    if (req.method() === 'OPTIONS') {
      return req.respond({ status: 204, headers: CORS, body: '' })
    }
    let data = { records: [], total: 0, list: [] }
    if (url.includes('/client/category/list')) {
      data = cats
    } else if (url.includes('/client/favorite/folder/list')) {
      data = [
        { folderUid: 'f1', name: '默认收藏夹', mediaCount: 6 },
        { folderUid: 'f2', name: '稍后再看', mediaCount: 4 },
        { folderUid: 'f3', name: '学习资料', mediaCount: 3 }
      ]
    } else if (url.includes('/client/favorite/detail')) {
      const body = JSON.parse(req.postData() || '{}')
      const n = body.folderUid === 'f2' ? 4 : body.folderUid === 'f3' ? 3 : 6
      data = { list: { records: mkFavVideos(n, body.folderUid || 'fav'), total: n } }
    } else if (url.includes('/client/favorite/search')) {
      data = { records: mkFavVideos(3, '搜索'), total: 3 }
    } else if (url.includes('/client/watch-history/search')) {
      data = {
        records: [
          { month: '2026-11', days: [
            { date: '2026-11-11', items: mkHistory(3, '2026-11-11') },
            { date: '2026-11-10', items: mkHistory(2, '2026-11-10') }
          ] },
          { month: '2026-10', days: [
            { date: '2026-10-30', items: mkHistory(4, '2026-10-30') }
          ] }
        ],
        total: 2,
        size: 10,
        current: 1
      }
    } else if (url.includes('/client/video/list')) {
      data = { records: mkVideos(8, 'cat'), total: 8 }
    } else if (/\/client\/video\/[^/]+\/episode\/[^/]+/.test(url)) {
      data = mkPlayVideo()
    } else if (url.includes('/client/video/recommend')) {
      data = { banner: mkVideos(2, 'banner'), cards: mkVideos(4, 'card') }
    } else if (url.includes('/client/user') && !url.includes('refresh')) {
      data = user
    } else if (url.includes('/client/follow/fans')) {
      data = { records: mkUsers(3, '粉丝'), total: 356 }
    } else if (url.includes('follow')) {
      data = { records: mkUsers(3, '关注'), total: 128 }
    }
    return req.respond({
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 200, data, message: 'ok' })
    })
  }
  return req.continue()
})
const ROUTE = process.argv[3] || '/#/profile'
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {})
await new Promise((r) => setTimeout(r, 2500))
// 隐藏 vite Vue DevTools 悬浮按钮，避免遮挡底部栏
await page.evaluate(() => {
  const kill = () => document.querySelectorAll('vue-devtools, [id*="devtools"], [class*="devtools"]').forEach((el) => { if (el.tagName !== 'MAIN') el.remove() })
  kill()
  setTimeout(kill, 500)
})
await new Promise((r) => setTimeout(r, 600))
const waitImages = async () => {
  await page.evaluate(async () => {
    const imgs = Array.from(document.images)
    await Promise.race([
      Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r })))),
      new Promise((r) => setTimeout(r, 8000))
    ])
  }).catch(() => {})
}
await waitImages()
const CLICKS = process.argv[4] ? process.argv[4].split('|').filter(Boolean) : []
for (const sel of CLICKS) {
  await page.click(sel).catch(() => {})
  await new Promise((r) => setTimeout(r, 2000))
}
const TYPE = process.argv[5]
if (TYPE) {
  await page.click('.van-search input').catch(() => {})
  await page.type('.van-search input', TYPE, { delay: 40 }).catch(() => {})
  await page.keyboard.press('Enter')
  await new Promise((r) => setTimeout(r, 2000))
}
await waitImages()
await page.screenshot({ path: OUT, fullPage: !CLICKS.length })
const probe = await page.evaluate(() => ({
  app: (document.getElementById('app')?.innerHTML || '').slice(0, 200),
  text: (document.body.innerText || '').slice(0, 400),
  card: !!document.querySelector('.profile-card'),
  imgs: (() => { const a = [...document.images]; return `loaded=${a.filter((i) => i.complete && i.naturalWidth > 0).length}/${a.length}` })(),
  imgStates: [...document.images].slice(0, 3).map((i) => ({ src: (i.getAttribute('src') || '').slice(0, 80), complete: i.complete, nw: i.naturalWidth })),
  title0: document.querySelector('.history-title')?.textContent || 'none',
  header: !!document.querySelector('.mobile-header, header'),
  scroll: `${document.documentElement.scrollHeight}/${document.documentElement.clientHeight}`,
  mc: (() => {
    const el = document.querySelector('.main-content')
    if (!el) return 'none'
    return `${el.className} h=${Math.round(el.getBoundingClientRect().height)} minH=${getComputedStyle(el).minHeight}`
  })(),
  kids: [...document.querySelectorAll('#app > *')].map(e => `${e.tagName}.${(e.className || '').toString().split(' ').slice(0, 2).join('.')}:${Math.round(e.getBoundingClientRect().height)}`)
}))
console.log('url=', page.url(), JSON.stringify(probe), 'errors=', errors.join(' ; ') || 'none')
fs.writeFileSync('probe-latest.json', JSON.stringify(probe, null, 2))
await browser.close()
