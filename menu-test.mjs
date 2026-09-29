import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const CDP = 'http://127.0.0.1:9333'

async function connect() {
  try { return await puppeteer.connect({ browserURL: CDP }) } catch {}
  const { spawn } = await import('node:child_process')
  spawn(EDGE, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=C:\\temp\\pptr4', '--no-first-run', '--disable-gpu', 'about:blank'], { detached: true, stdio: 'ignore' }).unref()
  for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 500)); try { return await puppeteer.connect({ browserURL: CDP }) } catch {} }
  throw new Error('cannot connect')
}

// 真实 menu 表数据（status=true，即后端会返回给前端的 19 条）
const MENU = [
  { id: 1, parentId: 0, menuName: '仪表盘', path: '/', menuIdentification: 'Dashboard', category: 'MAIN', status: true, descSort: 1, icon: 'DataBoard' },
  { id: 2, parentId: 0, menuName: '数据分析', path: '/data-analysis', menuIdentification: 'DataAnalysis', category: 'MAIN', status: true, descSort: 2, icon: 'TrendCharts' },
  { id: 4, parentId: 0, menuName: '视频管理', path: '/video-manage', menuIdentification: 'VideoManage', category: 'MANAGEMENT', status: true, descSort: 4, icon: 'VideoCamera' },
  { id: 5, parentId: 0, menuName: '人员管理', path: '/users', menuIdentification: 'UserManage', category: 'MANAGEMENT', status: true, descSort: 5, icon: 'User' },
  { id: 6, parentId: 0, menuName: '角色管理', path: '/roles', menuIdentification: 'Role', category: 'MANAGEMENT', status: true, descSort: 6, icon: 'UserFilled' },
  { id: 7, parentId: 0, menuName: '菜单管理', path: '/menus', menuIdentification: 'MenuManage', category: 'MANAGEMENT', status: true, descSort: 7, icon: 'Menu' },
  { id: 18, parentId: 0, menuName: '分类管理', path: '/category-manage', menuIdentification: 'CategoryManage', category: 'MANAGEMENT', status: true, descSort: 8, icon: 'Folder' },
  { id: 8, parentId: 0, menuName: '评论管理', path: '/comment-manage', menuIdentification: 'CommentManage', category: 'MANAGEMENT', status: true, descSort: 9, icon: 'ChatDotRound' },
  { id: 10, parentId: 0, menuName: '内容审核', path: '/content', menuIdentification: '', category: 'MANAGEMENT', status: true, descSort: 11, icon: 'CircleCheck' },
  { id: 11, parentId: 0, menuName: '系统设置', path: '/settings', menuIdentification: 'Settings', category: 'MANAGEMENT', status: true, descSort: 12, icon: 'Tools' },
  { id: 14, parentId: 0, menuName: '系统日志', path: '/system-log', menuIdentification: 'SystemLog', category: 'MANAGEMENT', status: true, descSort: 14, icon: 'Document' },
  { id: 20, parentId: 10, menuName: '稿件/评论审核', path: '/review', menuIdentification: 'ReviewManage', category: 'MANAGEMENT', status: true, descSort: 19, icon: 'Document' },
  { id: 19, parentId: 10, menuName: '稿件投诉', path: '/video-complaint', menuIdentification: 'ReviewComplaint', category: 'MANAGEMENT', status: true, descSort: 20, icon: 'Warning' },
  { id: 12, parentId: 11, menuName: '网站设置', path: '/settings', menuIdentification: '', category: 'MANAGEMENT', status: true, descSort: 13, icon: 'Setting' },
  { id: 13, parentId: 11, menuName: '系统信息', path: '/system-info', menuIdentification: 'SystemInfo', category: 'MANAGEMENT', status: true, descSort: 15, icon: 'Monitor' },
  { id: 15, parentId: 14, menuName: '登录日志', path: '/login-log', menuIdentification: 'LoginLog', category: 'MANAGEMENT', status: true, descSort: 16, icon: 'Key' },
  { id: 16, parentId: 14, menuName: '运行日志', path: '/operation-log', menuIdentification: 'OperationLog', category: 'MANAGEMENT', status: true, descSort: 17, icon: 'Cpu' },
  { id: 17, parentId: 14, menuName: '日志统计', path: '/log-statistics', menuIdentification: 'LogStatistics', category: 'MANAGEMENT', status: true, descSort: 18, icon: 'DataAnalysis' }
]

const tree = MENU.filter(m => m.parentId === 0).map(p => ({ ...p, children: MENU.filter(c => c.parentId === p.id) }))

const TARGETS = [
  { name: '仪表盘', path: '/dashboard' },
  { name: '数据分析', path: '/data-analysis' },
  { name: '视频管理', path: '/video-manage' },
  { name: '人员管理', path: '/users' },
  { name: '角色管理', path: '/roles' },
  { name: '菜单管理', path: '/menus' },
  { name: '分类管理', path: '/category-manage' },
  { name: '评论管理', path: '/comment-manage' },
  { parent: '内容审核', name: '稿件/评论审核', path: '/review' },
  { parent: '内容审核', name: '稿件投诉', path: '/review/complaint' },
  { parent: '系统设置', name: '网站设置', path: '/settings' },
  { parent: '系统设置', name: '系统信息', path: '/system-info' },
  { parent: '系统日志', name: '登录日志', path: '/login-log' },
  { parent: '系统日志', name: '运行日志', path: '/operation-log' },
  { parent: '系统日志', name: '日志统计', path: '/log-statistics' }
]

const cors = (extra = {}) => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', ...extra })

const browser = await connect()
const page = await browser.newPage()
const warns = []
const errs = []
page.on('console', m => { if (m.type() === 'warning') warns.push(m.text()); if (m.type() === 'error') errs.push(m.text()) })
page.on('pageerror', e => errs.push('[pageerror] ' + e.message))

await page.evaluateOnNewDocument(m => {
  localStorage.setItem('accessToken', 'test-token')
  localStorage.setItem('refreshToken', 'test-refresh')
  localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'admin' }))
  localStorage.setItem('userInfo', JSON.stringify({ id: 1, nickName: '管理员', menuList: m }))
}, tree)

await page.setRequestInterception(true)
page.on('request', async req => {
  try {
    const u = new URL(req.url())
    if (req.method() === 'OPTIONS') { await req.respond({ status: 204, headers: cors() }); return }
    if (u.port === '8899') {
      let body = { code: 200, data: {} }
      if (u.pathname === '/api/admin/report/list') body = { code: 200, data: { total: 0, records: [] } }
      await req.respond({ status: 200, headers: cors({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) })
      return
    }
    await req.continue()
  } catch { try { await req.continue() } catch {} }
})

const ok = [], bad = []
const t = (n, c, extra = '') => (c ? ok.push(n) : bad.push(n + (extra ? `  [${extra}]` : '')))

await page.goto('http://localhost:5174/dashboard', { waitUntil: 'networkidle2', timeout: 30000 })
await page.waitForSelector('.sidebar .menu-item', { timeout: 15000 })

const menuCount = await page.$$eval('.sidebar .menu-item', els => els.length)
t('渲染 18 个菜单(18条,其中3个为父级)', menuCount === 18, `实际 ${menuCount}`)

async function clickByText(txt) {
  return await page.evaluate(t2 => {
    const els = [...document.querySelectorAll('.sidebar .menu-item')]
    const el = els.find(e => e.querySelector('.menu-text')?.textContent.trim() === t2)
    if (!el) return false
    el.click()
    return true
  }, txt)
}
async function isActive(txt) {
  return await page.evaluate(t2 => {
    const els = [...document.querySelectorAll('.sidebar .menu-item')]
    const el = els.find(e => e.querySelector('.menu-text')?.textContent.trim() === t2)
    return !!el && el.classList.contains('active')
  }, txt)
}

for (const tg of TARGETS) {
  if (tg.parent) { await clickByText(tg.parent); await new Promise(r => setTimeout(r, 250)) }
  const found = await clickByText(tg.name)
  if (!found) { t(`点击 ${tg.name}`, false, '未找到菜单项'); continue }
  let url = new URL(page.url()).pathname
  for (let i = 0; i < 30 && url !== tg.path; i++) {
    await new Promise(r => setTimeout(r, 100))
    url = new URL(page.url()).pathname
  }
  t(`${tg.name} → ${tg.path}`, url === tg.path, `实际 ${url}`)
  await new Promise(r => setTimeout(r, 200))
  const active = await isActive(tg.name)
  t(`${tg.name} 高亮`, active)
}

// 关键回归：网站设置
t('网站设置解析成功(无告警)', !warns.some(w => w.includes('网站设置')), warns.filter(w => w.includes('解析失败')).join(' || '))
t('全站无菜单解析失败告警', warns.filter(w => w.includes('[menu] 菜单解析失败')).length === 0, warns.filter(w => w.includes('[menu]')).join(' || '))

// 父级不产生告警（内容审核 path=/content 在路由表中不存在）
t('父级菜单不告警', !warns.some(w => w.includes('内容审核')), warns.join(' || '))

// 直接深链 /settings 时侧边栏应高亮
await page.goto('http://localhost:5174/settings', { waitUntil: 'networkidle2', timeout: 30000 })
await page.waitForSelector('.sidebar .menu-item', { timeout: 15000 })
await new Promise(r => setTimeout(r, 500))
t('深链 /settings 网站设置高亮', await isActive('网站设置'))

console.log('\n--- PASS ---'); ok.forEach(x => console.log('  ✓ ' + x))
if (bad.length) { console.log('--- FAIL ---'); bad.forEach(x => console.log('  ✗ ' + x)) }
console.log(`\n${ok.length} passed, ${bad.length} failed`)
if (warns.length) { console.log('\nWARNINGS:'); warns.forEach(w => console.log('  ' + w)) }
if (errs.length) { console.log('\nERRORS:'); errs.slice(0, 8).forEach(w => console.log('  ' + w)) }

await page.close(); browser.disconnect()
process.exit(bad.length ? 1 : 0)
