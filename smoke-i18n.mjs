// 运行时 i18n 验收：遍历路由，断言 en 无中文 UI、zh 仍为中文，且无 JS 错误
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
  {
    id: 10, menuName: '内容审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck', category: 'MAIN',
    children: [
      { id: 101, menuName: '稿件/评论审核', menuIdentification: 'ReviewManage', icon: 'CircleCheck' },
      { id: 102, menuName: '稿件投诉', menuIdentification: 'ReviewComplaint', icon: 'Warning' }
    ]
  },
  {
    id: 11, menuName: '系统设置', menuIdentification: 'Settings', icon: 'Setting', category: 'MAIN',
    children: [{ id: 111, menuName: '网站设置', menuIdentification: 'Settings', icon: 'Monitor' }]
  },
  { id: 12, menuName: '系统信息', menuIdentification: 'SystemInfo', icon: 'Monitor', category: 'MAIN' },
  {
    id: 13, menuName: '系统日志', menuIdentification: 'SystemLog', icon: 'Document', category: 'MAIN',
    children: [
      { id: 131, menuName: '登录日志', menuIdentification: 'LoginLog', icon: 'Key' },
      { id: 132, menuName: '运行日志', menuIdentification: 'OperationLog', icon: 'Cpu' },
      { id: 133, menuName: '日志统计', menuIdentification: 'LogStatistics', icon: 'DataAnalysis' }
    ]
  }
]

const USER = {
  id: 1, name: 'admin', userName: 'admin', email: 'admin@example.com', avatar: '',
  roleId: 1, roleName: '超级管理员', roleLevel: 1, status: 1, menuList: MENU_LIST
}

const USER_INFO = { ...USER, nickName: 'admin', phone: '', remark: '' }

// 路径, 中文预期(页面标题), 英文预期（登录页单独跑：需要无 token 的页面）
const ROUTES = [
  ['/dashboard', '工作台', 'Dashboard'],
  ['/data-analysis', '数据分析', 'Analytics'],
  ['/video-manage', '视频管理', 'Videos'],
  ['/users', '人员管理', 'Users'],
  ['/vip-manage', '大会员管理', 'VIP Membership'],
  ['/goods-manage', '商品管理', 'Goods'],
  ['/roles', '角色管理', 'Roles'],
  ['/menus', '菜单管理', 'Menus'],
  ['/category-manage', '分类管理', 'Categories'],
  ['/dict', '字典管理', 'Dictionary'],
  ['/comment-manage', '评论管理', 'Comments'],
  ['/review', '内容审核', 'Content Review'],
  ['/review/complaint', '稿件投诉', 'Complaints'],
  ['/settings', '系统设置', 'Settings'],
  ['/system-info', '系统信息', 'System Info'],
  ['/system-log', '系统日志', 'System Logs'],
  ['/login-log', '登录日志', 'Login Logs'],
  ['/operation-log', '运行日志', 'Operation Logs'],
  ['/log-statistics', '日志统计', 'Log Stats'],
  ['/profile', '个人中心', 'Profile'],
  ['/notice', '通知设置', 'Notifications'],
  ['/this-page-does-not-exist', '页面不存在', 'Page not found']
]

// 英文界面里不允许出现的中文 UI 文案
const FORBIDDEN = [
  '暂无数据', '搜索', '重置', '删除', '编辑', '新增', '添加', '刷新', '返回', '状态', '操作',
  '启用', '禁用', '确认', '取消', '保存', '全部', '导出', '加载中', '请输入', '请选择',
  '个人中心', '系统设置', '字典管理', '评论管理', '分类管理', '菜单管理', '角色管理', '人员管理',
  '视频管理', '系统日志', '登录日志', '运行日志', '日志统计', '数据分析', '工作台', '稿件投诉',
  '内容审核', '系统信息', '网站设置', '安全设置', '通知设置', '外观设置', '审核设置', '默认设置',
  '账号登录', '邮箱登录', '记住我', '忘记密码', '获取验证码', '登 录', '视频内容管理平台',
  '收起侧边栏', '展开侧边栏', '退出登录', '修改密码'
]

const PAGINATED = /\/(video|comment|category|menu|loginLog|operationLog|report|role|user)\/list|review-list|dict\/type\/list|dict\/data\/list/
const ARRAYISH = /\/(category\/enabled|menu\/options|role\/getBindMenuIds|dict\/data\/enabled|comment\/status-stats|video\/review-stats|operationLog\/(trend|accountRank|ipRank|hourlyActive)|stats\/(active-users|daily-increment|category-daily-increment)|loginLog\/trend|config\/list)/

function mockBody(url) {
  const u = url.split('?')[0]
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

async function makePage(browser, language, withAuth = true) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument((lang, userInfo, auth) => {
    try {
      localStorage.setItem('language', lang)
      if (auth) {
        localStorage.setItem('accessToken', 'test-token')
        localStorage.setItem('refreshToken', 'test-refresh')
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'admin', userName: 'admin', email: 'admin@example.com', avatar: '', roleId: 1, roleName: '超级管理员', status: 1 }))
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userInfo')
      }
    } catch (e) { /* noop */ }
  }, language, USER_INFO, withAuth)
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

function attachMock(page) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', (req) => {
      const url = req.url()
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

async function runLogin(browser, language) {
  const page = await makePage(browser, language, false)
  const errors = []
  hookErrors(page, errors)
  await attachMock(page)
  const fail = []
  let text = ''
  try {
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForSelector('.login-title', { timeout: 10000 }).catch(() => {})
    await new Promise((r) => setTimeout(r, 900))
    text = await page.evaluate(() => document.body.innerText || '')
  } catch (e) {
    fail.push(`导航失败: ${e.message}`)
  }
  const need = language === 'en' ? 'Account Login' : '账号登录'
  if (!text.includes(need)) fail.push(`未出现 "${need}"`)
  if (language === 'en') {
    const hits = FORBIDDEN.filter((w) => text.includes(w))
    for (const w of hits) fail.push(`残留中文 "${w}"`)
  }
  if (errors.length) fail.push(...errors)
  await page.close()
  return { path: '/login', fail }
}

async function runPass(browser, language) {
  const page = await makePage(browser, language)
  const errors = []
  hookErrors(page, errors)
  await attachMock(page)

  const results = []

  for (const [path, zh, en] of ROUTES) {
    errors.length = 0
    let text = ''
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForSelector('.bc-current, .login-title', { timeout: 10000 }).catch(() => {})
      await new Promise((r) => setTimeout(r, 900))
      text = await page.evaluate(() => document.body.innerText || '')
    } catch (e) {
      results.push({ path, fail: [`导航失败: ${e.message}`] })
      continue
    }

    const fail = []
    if (language === 'en') {
      const hits = FORBIDDEN.filter((w) => text.includes(w))
      for (const w of hits) {
        const i = text.indexOf(w)
        const ctx = text.slice(Math.max(0, i - 40), i + w.length + 40).replace(/\n/g, '⏎')
        fail.push(`残留中文 "${w}": …${ctx}…`)
      }
      if (!text.includes(en)) fail.push(`未出现英文标题 "${en}"`)
    } else {
      if (!text.includes(zh)) fail.push(`未出现中文标题 "${zh}"`)
    }
    if (!text.trim()) fail.push('页面文本为空')
    if (errors.length) fail.push(...errors)
    results.push({ path, fail })
  }

  await page.close()
  return results
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  userDataDir: String.raw`C:\temp\pptr-i18n`,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1440,900']
})

try {
  let bad = 0
  for (const lang of ['en', 'zh-cn']) {
    console.log(`\n======== ${lang} ========`)
    const results = [await runLogin(browser, lang), ...(await runPass(browser, lang))]
    for (const r of results) {
      if (r.fail.length) {
        bad++
        console.log(`✗ ${r.path}`)
        r.fail.forEach((f) => console.log(`    ${f}`))
      } else {
        console.log(`✓ ${r.path}`)
      }
    }
  }
  console.log(`\n===== 结果：${bad} 个页面未通过 =====`)
  process.exitCode = bad ? 1 : 0
} finally {
  await browser.close().catch(() => {})
}
