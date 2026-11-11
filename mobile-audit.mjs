import puppeteer from 'puppeteer-core'
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:5175'
const OUT = 'D:/ai/ai_coding/video-adminster/vue-front-mobile/docs/mobile-audit'
fs.mkdirSync(OUT, { recursive: true })

const profileDir = `${process.env.TEMP}\\opencode\\edge-m-profile-${Date.now()}`
const edgeProc = spawn(EDGE, ['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=9336',`--user-data-dir=${profileDir}`], { detached: true, stdio: 'ignore' })
edgeProc.unref()

let wsEndpoint = null
for (let i = 0; i < 40 && !wsEndpoint; i++) {
  try {
    const r = await fetch('http://127.0.0.1:9336/json/version')
    wsEndpoint = (await r.json()).webSocketDebuggerUrl
  } catch { await new Promise(r => setTimeout(r, 500)) }
}
const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint })

const pages = [
  ['home', '/#/', true],
  ['category', '/#/category/2', true],
  ['search', '/#/search?q=%E6%B7%B1%E6%B5%B7&type=video', true],
  ['play', '/#/client/video/avqf1hHM9eI8/episode/avqf2hzNzPCE', true],
  ['login', '/#/login', false],
  ['register', '/#/register', false],
  ['contribution', '/#/contribution', true],
  ['episodes', '/#/contribution/episodes/avqf1hHM9eI8', true],
  ['profile', '/#/profile', true],
  ['history', '/#/history', true],
  ['message', '/#/messages', true],
  ['up', '/#/up/u001', true],
  ['pay', '/#/pay/result?orderNo=test', true]
]

for (const [name, path, auth] of pages) {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  if (auth) {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('frontAccessToken', 'mock-token')
      localStorage.setItem('frontUser', JSON.stringify({ uid: 'u001', nickname: '移动端用户', avatarUrl: '' }))
    })
  }
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)))
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 20000 })
  } catch {}
  await new Promise(r => setTimeout(r, 2500))
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    const wide = []
    if (de.scrollWidth > de.clientWidth) {
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.right > de.clientWidth + 2 && r.width > 40 && el.children.length < 8) {
          wide.push(`${el.tagName}.${(el.className && el.className.toString && el.className.toString().split(' ')[0]) || ''} right=${Math.round(r.right)}`)
        }
      })
    }
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, wide: wide.slice(0, 8) }
  })
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  console.log(`[${name}] scroll=${overflow.scrollWidth}/${overflow.clientWidth}`, overflow.wide.join(' | '), errors.length ? `JSERR: ${errors.join(' ; ')}` : '')
  await page.close()
}

await browser.disconnect()
try { spawn('taskkill', ['/PID', String(edgeProc.pid), '/T', '/F'], { stdio: 'ignore' }) } catch {}
console.log('done')
