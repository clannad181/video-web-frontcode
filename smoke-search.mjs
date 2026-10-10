// 全局搜索（GET /admin/search）运行时验收：请求参数/三组面板/键盘与点击跳转/query 回填/中英文案
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4000'
const EDGE = String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
const API = 'localhost:8899'

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
  { id: 10, menuName: '内容审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck', category: 'MAIN', children: [{ id: 101, menuName: '稿件/评论审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck' }, { id: 102, menuName: '稿件投诉', menuIdentification: 'ReviewComplaint', icon: 'Warning' }] },
  { id: 11, menuName: '系统设置', menuIdentification: 'Settings', icon: 'Setting', category: 'MAIN', children: [{ id: 111, menuName: '网站设置', menuIdentification: 'Settings', icon: 'Monitor' }] },
  { id: 12, menuName: '系统信息', menuIdentification: 'SystemInfo', icon: 'Monitor', category: 'MAIN' },
  { id: 13, menuName: '系统日志', menuIdentification: 'SystemLog', icon: 'Document', category: 'MAIN', children: [{ id: 131, menuName: '登录日志', menuIdentification: 'LoginLog', icon: 'Key' }, { id: 132, menuName: '运行日志', menuIdentification: 'OperationLog', icon: 'Cpu' }, { id: 133, menuName: '日志统计', menuIdentification: 'LogStatistics', icon: 'DataAnalysis' }] }
]
const USER_INFO = {
  id: 1, name: 'admin', userName: 'admin', email: 'admin@example.com', avatar: '',
  roleId: 1, roleName: '超级管理员', roleLevel: 1, status: 1, menuList: MENU_LIST,
  nickName: 'admin', phone: '', remark: ''
}

function searchBody(keyword) {
  const empty = { videos: [], users: [], comments: [] }
  if (keyword === 'zzzz') return { code: 200, msg: 'ok', data: empty }
  const two = keyword === 'two'
  return {
    code: 200, msg: 'ok',
    data: {
      videos: [{
        id: two ? 102 : 101, avid: two ? 'av1002' : 'av1001',
        title: two ? 'Test Video Two' : 'Test Video One',
        coverUrl: '', totalDuration: 600, episodeCount: 1,
        playCount: 12345, favoriteCount: 678, categoryName: 'Anime',
        nickName: 'uploader01', avatarUrl: '', uid: 'u1001', isOngoing: false,
        videoStatus: 2, reviewStatus: 2, createTime: '2026-01-02 10:00:00'
      }],
      users: [{
        id: 201, uid: 'u2001', userName: 'alice', nikeName: 'Alice',
        email: 'alice@example.com', avatar: '', status: 0, type: 0, isVip: 0,
        roleId: 2, level: 1, roleName: '管理员', createTime: '2026-01-03 09:00:00', sex: true, descript: ''
      }],
      comments: [{
        id: 301, videoId: two ? 102 : 101, episodeId: null,
        videoTitle: two ? 'Test Video Two' : 'Test Video One', videoCover: '',
        userId: 201, nickName: 'Alice', avatar: '', parentId: 0, rootId: 0,
        content: 'Nice test comment', likeCount: 3, replyCount: 0,
        status: 0, liked: false, replies: [], createTime: '2026-01-04 11:00:00'
      }]
    }
  }
}

const PAGINATED = /\/(video|comment|category|menu|loginLog|operationLog|report|role|user)\/list|review-list|dict\/type\/list|dict\/data\/list/
const ARRAYISH = /\/(category\/enabled|menu\/options|role\/getBindMenuIds|dict\/data\/enabled|comment\/status-stats|video\/review-stats|operationLog\/(trend|accountRank|ipRank|hourlyActive)|stats\/(active-users|daily-increment|category-daily-increment)|loginLog\/trend|config\/list)/

function mockBody(url) {
  const u = url.split('?')[0]
  if (u.includes('/admin/search')) {
    const keyword = new URLSearchParams(url.split('?')[1] || '').get('keyword') || ''
    return searchBody(keyword)
  }
  if (u.includes('/admin/user/userInfo')) return { code: 200, msg: 'ok', data: USER_INFO }
  if (u.includes('/admin/user/captcha')) return { code: 200, msg: 'ok', data: { key: 'k-1', image: '' } }
  if (PAGINATED.test(u)) {
    return {
      code: 200, msg: 'ok',
      data: { records: [], rows: [], list: [], items: [], total: 0, count: 0, pages: 0, size: 10, current: 1, pageNum: 1, pageSize: 10 }
    }
  }
  if (ARRAYISH.test(u)) return { code: 200, msg: 'ok', data: [] }
  return { code: 200, msg: 'ok', data: { total: 0, count: 0, size: 10, current: 1, list: [], records: [], rows: [] } }
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin,access-control-request-headers'
}

async function makePage(browser, language) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument((lang, userInfo) => {
    try {
      localStorage.setItem('language', lang)
      localStorage.setItem('accessToken', 'test-token')
      localStorage.setItem('refreshToken', 'test-refresh')
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'admin', userName: 'admin', email: 'admin@example.com', avatar: '', roleId: 1, roleName: '超级管理员', status: 1 }))
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    } catch (e) { /* noop */ }
  }, language, USER_INFO)
  return page
}

function hookErrors(page, bucket) {
  page.on('pageerror', (e) => bucket.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (/favicon|Failed to load resource/.test(t)) return
    bucket.push(`console: ${t}`)
  })
}

function attachMock(page, searchCalls) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', (req) => {
      const url = req.url()
      if (url.includes('/admin/search') && req.method() !== 'OPTIONS') searchCalls.push(url)
      if (!url.includes(API)) return req.continue().catch(() => {})
      const reqHeaders = req.headers()
      const allowHeaders = reqHeaders['access-control-request-headers'] || CORS['access-control-allow-headers']
      const cors = { ...CORS, 'access-control-allow-headers': allowHeaders }
      if (req.method() === 'OPTIONS') {
        return req.respond({ status: 204, headers: { ...cors, 'content-length': '0' } }).catch(() => {})
      }
      const body = JSON.stringify(mockBody(url))
      return req.respond({ status: 200, contentType: 'application/json;charset=utf-8', headers: cors, body }).catch(() => {})
    })
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const panelText = (page) => page.evaluate(() => document.querySelector('.search-panel')?.innerText || '')
const activeText = (page) => page.evaluate(() => document.querySelector('.sp-item.active')?.innerText || '')
const urlPath = (page) => page.evaluate(() => location.pathname + location.search)
const inputFocused = (page) => page.evaluate(() => document.activeElement?.classList?.contains('search-input') || false)

async function clearInput(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.search-input')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(el, '')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function searchFor(page, keyword) {
  await page.click('.search-input')
  await clearInput(page)
  await page.type('.search-input', keyword, { delay: 25 })
}

async function runZh(browser) {
  const fail = []
  const errors = []
  const searchCalls = []
  const page = await makePage(browser, 'zh-cn')
  hookErrors(page, errors)
  await attachMock(page, searchCalls)

  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForSelector('.search-input', { timeout: 10000 })
  await sleep(700)

  // 1) Ctrl+K 聚焦搜索框
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyK')
  await page.keyboard.up('Control')
  if (!(await inputFocused(page))) fail.push('Ctrl+K 未聚焦搜索框')

  // 2) 输入关键词：300ms 防抖 + 只发一次请求（keyword/limit）
  await page.type('.search-input', 'test', { delay: 25 })
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('Test Video One'), { timeout: 8000 }).catch(() => fail.push('面板未渲染视频结果'))
  await sleep(300)
  if (searchCalls.length !== 1) fail.push(`防抖后应恰好 1 次请求，实际 ${searchCalls.length}`)
  const p = new URLSearchParams(searchCalls[0].split('?')[1] || '')
  if (p.get('keyword') !== 'test') fail.push(`keyword 应为 test，实际 ${p.get('keyword')}`)
  if (p.get('limit') !== '10') fail.push(`limit 应为 10，实际 ${p.get('limit')}`)

  const heads = await page.$$eval('.sp-head', (els) => els.map((e) => e.textContent))
  for (const name of ['视频', '用户', '评论']) {
    if (!heads.some((h) => h.includes(name))) fail.push(`缺少分组「${name}」`)
  }
  const text = await panelText(page)
  for (const s of ['Test Video One', 'av1001', 'Anime', 'uploader01', 'Alice', 'alice@example.com', 'Nice test comment', 'Test Video One', '启用', '最多显示10条', '↑↓ 选择 · Enter 打开 · Esc 关闭']) {
    if (!text.includes(s)) fail.push(`面板缺少「${s}」`)
  }

  // 3) 键盘导航：初始视频 → ↓ 用户 → ↓ 评论 → Enter 打开
  if (!(await activeText(page)).includes('Test Video One')) fail.push('初始高亮应为视频结果')
  await page.keyboard.press('ArrowDown')
  if (!(await activeText(page)).includes('Alice')) fail.push('↓ 后高亮应为用户结果')
  await page.keyboard.press('ArrowDown')
  if (!(await activeText(page)).includes('Nice test comment')) fail.push('↓ 后高亮应为评论结果')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => location.pathname === '/comment-manage', { timeout: 8000 }).catch(() => fail.push('Enter 未跳转评论管理'))
  const u1 = await urlPath(page)
  if (decodeURIComponent(u1.replace(/\+/g, '%20')) !== '/comment-manage?keyword=Nice test comment') fail.push(`评论跳转 URL 异常: ${u1}`)
  await page.waitForFunction(() => document.querySelector('.filter-input')?.value === 'Nice test comment', { timeout: 8000 }).catch(() => fail.push('评论页未回填 keyword'))

  // 4) 点击用户结果 → /users?userName=alice 并回填
  await searchFor(page, 'alice')
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('Alice'), { timeout: 8000 }).catch(() => fail.push('第二次搜索未出结果'))
  const items = await page.$$('.sp-item')
  if (items.length !== 3) fail.push(`应有 3 条结果，实际 ${items.length}`)
  await items[1].click()
  await page.waitForFunction(() => location.pathname === '/users', { timeout: 8000 }).catch(() => fail.push('点击用户结果未跳转'))
  const u2 = await urlPath(page)
  if (decodeURIComponent(u2) !== '/users?userName=alice') fail.push(`用户跳转 URL 异常: ${u2}`)
  await page.waitForFunction(() => document.querySelector('.filter-input')?.value === 'alice', { timeout: 8000 }).catch(() => fail.push('用户页未回填 userName'))

  // 5) 点击视频结果 → /video-manage?videoId=102 并回填
  await searchFor(page, 'two')
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('Test Video Two'), { timeout: 8000 }).catch(() => fail.push('视频搜索未出结果'))
  const items2 = await page.$$('.sp-item')
  await items2[0].click()
  await page.waitForFunction(() => location.pathname === '/video-manage', { timeout: 8000 }).catch(() => fail.push('点击视频结果未跳转'))
  const u3 = await urlPath(page)
  if (u3 !== '/video-manage?videoId=av1002') fail.push(`视频跳转 URL 异常: ${u3}`)
  await page.waitForFunction(() => document.querySelector('.filter-input')?.value === 'av1002', { timeout: 8000 }).catch(() => fail.push('视频页未回填 videoId'))

  // 6) 同页换 videoId（watch 兜底，不离开页面）
  await searchFor(page, 'test')
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('Test Video One'), { timeout: 8000 }).catch(() => fail.push('同页搜索未出结果'))
  const items3 = await page.$$('.sp-item')
  await items3[0].click()
  await page.waitForFunction(() => location.search === '?videoId=av1001', { timeout: 8000 }).catch(() => fail.push('同页切换 videoId 未更新 URL'))
  await page.waitForFunction(() => document.querySelector('.filter-input')?.value === 'av1001', { timeout: 8000 }).catch(() => fail.push('同页切换后输入框未回填 av1001'))

  // 7) 空结果态 + Esc 关闭
  await searchFor(page, 'zzzz')
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('未找到相关内容'), { timeout: 8000 }).catch(() => fail.push('空结果态文案缺失'))
  await page.keyboard.press('Escape')
  await sleep(200)
  if (await page.$('.search-panel')) fail.push('Esc 未关闭面板')
  if (await inputFocused(page)) fail.push('Esc 未失焦')

  if (errors.length) fail.push(...errors)
  await page.close()
  return fail
}

async function runEn(browser) {
  const fail = []
  const errors = []
  const searchCalls = []
  const page = await makePage(browser, 'en')
  hookErrors(page, errors)
  await attachMock(page, searchCalls)

  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForSelector('.search-input', { timeout: 10000 })
  await sleep(700)

  const ph = await page.$eval('.search-input', (el) => el.placeholder)
  if (ph !== 'Search videos, users, comments...') fail.push(`EN placeholder 异常: "${ph}"`)

  await page.click('.search-input')
  await page.type('.search-input', 'test', { delay: 25 })
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('Test Video One'), { timeout: 8000 }).catch(() => fail.push('EN 面板未渲染结果'))

  const text = await panelText(page)
  for (const s of ['Video', 'Users', 'Comments', 'Published', 'Enabled', 'Administrator', 'Up to 10 per section', '↑↓ Navigate · Enter to open · Esc to close']) {
    if (!text.includes(s)) fail.push(`EN 面板缺少「${s}」`)
  }
  const cjk = text.match(/[\u4e00-\u9fa5]+/g)
  if (cjk) fail.push(`EN 面板残留中文: ${cjk.join(' / ')}`)

  await searchFor(page, 'zzzz')
  await page.waitForFunction(() => (document.querySelector('.search-panel')?.innerText || '').includes('No results found'), { timeout: 8000 }).catch(() => fail.push('EN 空结果态文案缺失'))

  if (errors.length) fail.push(...errors)
  await page.close()
  return fail
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  userDataDir: String.raw`C:\temp\pptr-search`,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1440,900']
})

try {
  const zh = await runZh(browser)
  const en = await runEn(browser)
  let bad = 0
  for (const [name, fails] of [['zh-cn', zh], ['en', en]]) {
    if (fails.length) {
      bad++
      console.log(`✗ ${name}`)
      fails.forEach((f) => console.log(`    ${f}`))
    } else {
      console.log(`✓ ${name}`)
    }
  }
  console.log(`\n===== 结果：${bad} 个语言未通过 =====`)
  process.exitCode = bad ? 1 : 0
} finally {
  await browser.close().catch(() => {})
}
