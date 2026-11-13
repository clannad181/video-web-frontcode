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

// 本地内联 SVG 图片（外网 picsum 不可达时验收截图也能稳定显示封面）
const PALETTES = [
  ['#FF8CB0', '#FF6699'], ['#8CB8FF', '#5B8CFF'], ['#FFD08C', '#FF9F45'],
  ['#9FE0C0', '#45B98C'], ['#C9A8FF', '#8B5CF6'], ['#FF9C9C', '#F05050']
]
const img = (seed, w = 320, h = 200, label = '') => {
  let hash = 0
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  const [c1, c2] = PALETTES[Math.abs(hash) % PALETTES.length]
  const text = label || String(seed).slice(0, 8)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${Math.round(w * 0.82)}" cy="${Math.round(h * 0.25)}" r="${Math.round(h * 0.3)}" fill="rgba(255,255,255,0.18)"/><text x="${w / 2}" y="${h / 2}" font-family="Arial" font-size="${Math.round(h / 5)}" fill="rgba(255,255,255,0.92)" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const mkVideos = (n, tag) => Array.from({ length: n }, (_, i) => ({
  id: `${tag}-${i}`,
  avid: `av${tag}${i}`,
  title: `${tag}示例标题 ${i + 1}：这是一段用于版式验收的较长视频标题`,
  coverUrl: img(`${tag}${i}`, 320, 200, `${i + 1}`),
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
  avatarUrl: img(`up${tag}${i}`, 80, 80, 'UP')
}))

// 观看历史接口的真实字段（videoTitle / videoCover / watchTime / watchedTime）
const mkHistory = (n, tag) => Array.from({ length: n }, (_, i) => ({
  videoAvid: `av-${tag}-${i}`,
  videoTitle: `历史视频 ${i + 1}：这是一段用于版式验收的较长视频标题`,
  videoCover: img(`h${tag.replace(/-/g, '')}${i}`, 320, 200, `${i + 1}`),
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
  videoCover: img(`f${tag}${i}`, 320, 200, `${i + 1}`),
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
  coverUrl: img('play', 640, 360, 'PLAY'),
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
  localStorage.setItem('frontSearchHistory', JSON.stringify(['年度动画混剪', '演唱会现场', '科技数码评测', '纪录片解说']))
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
    if (process.env.MOCK_LOG) console.log('[REQ]', req.method(), url, '| body:', (req.postData() || '').slice(0, 100))
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
      // 分页 mock：第1页 2026-11（5条），第2页 2026-10（4条），total=月数
      const hPage = JSON.parse(req.postData() || '{}').page || 1
      data = hPage === 1
        ? {
            records: [
              { month: '2026-11', days: [
                { date: '2026-11-11', items: mkHistory(4, '2026-11-11') },
                { date: '2026-11-10', items: mkHistory(4, '2026-11-10') },
                { date: '2026-11-09', items: mkHistory(4, '2026-11-09') }
              ] }
            ],
            total: 2,
            size: 20,
            current: 1
          }
        : {
            records: [
              { month: '2026-10', days: [
                { date: '2026-10-30', items: mkHistory(4, '2026-10-30') }
              ] }
            ],
            total: 2,
            size: 20,
            current: 2
          }
    } else if (url.includes('/client/search')) {
      const st = new URL(url).searchParams.get('type')
      data = st === 'up'
        ? { records: mkUsers(6, '搜索'), total: 6 }
        : { records: mkVideos(6, '搜索'), total: 6 }
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
    }).then(() => { if (process.env.MOCK_LOG) console.log('[RES ]', url.slice(0, 90)) })
      .catch((e) => console.log('[RES ERR]', url.slice(0, 90), e.message))
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
  if (sel === 'scroll') {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  } else {
    await page.click(sel).catch(() => {})
  }
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
  items: document.querySelectorAll('.history-item').length,
  hasLoadMoreBtn: document.body.innerText.includes('加载更多'),
  finished: document.body.innerText.includes('没有更多了'),
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
