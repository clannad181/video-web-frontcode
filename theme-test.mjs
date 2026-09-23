import puppeteer from 'puppeteer-core'
import fs from 'fs'

const OUT = 'C:/Users/张佳璐/AppData/Local/Temp/opencode/theme-test'
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--window-size=1600,900']
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 900 })

// 强制 prefers-reduced-motion: reduce，走降级路径复现用户场景
await page.emulateMediaFeatures([
  { name: 'prefers-reduced-motion', value: 'reduce' }
])

await page.setRequestInterception(true)
page.on('request', req => {
  const u = new URL(req.url())
  if (u.pathname.startsWith('/api/') || u.hostname === 'localhost:8899') {
    req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: { records: [], total: 0 } }) })
  } else {
    req.continue()
  }
})

await page.evaluateOnNewDocument(() => {
  localStorage.setItem('accessToken', 'test-token')
  localStorage.setItem('refreshToken', 'test-refresh')
  localStorage.setItem('darkMode', 'false')
})

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1500))

const info = await page.evaluate(() => ({
  url: location.href,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  hasToggle: !!document.querySelector('.theme-toggle')
}))
console.log('INFO:', JSON.stringify(info))
if (!info.hasToggle) { await browser.close(); process.exit(1) }

await page.evaluate(() => {
  window.__vtCalls = 0
  const orig = document.startViewTransition.bind(document)
  document.startViewTransition = (cb) => { window.__vtCalls++; return orig(cb) }
})

await page.click('.theme-toggle')

let prev = 0
for (const t of [50, 120, 200, 300, 420, 700]) {
  await new Promise(r => setTimeout(r, t - prev)); prev = t
  const s = await page.evaluate(() => {
    const am = document.querySelector('.app-main')
    const card = document.querySelector('.stat-card, .chart-card, .el-card')
    const sb = document.querySelector('.sidebar')
    const cs = el => el ? getComputedStyle(el) : null
    const amc = cs(am), cc = cs(card), sc = cs(sb)
    return {
      vt: window.__vtCalls,
      themeTransition: document.documentElement.classList.contains('theme-transition'),
      dark: document.documentElement.classList.contains('dark-mode'),
      appMainBg: amc?.backgroundColor,
      appMainTr: amc?.transitionDuration + '/' + amc?.transitionProperty.slice(0, 40),
      cardBg: cc?.backgroundColor,
      cardTr: cc?.transitionDuration,
      sidebarBg: sc?.backgroundColor,
      sidebarTr: sc?.transitionDuration
    }
  })
  console.log(`t=${t}ms:`, JSON.stringify(s, null, 1))
}

await browser.close()
