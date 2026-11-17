// 一次性脚本：用 Chromium 的 MediaRecorder 录一段 10 秒 VP8/webm 作为续播验收媒体
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

function pickBrowser() {
  const pwRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  for (const d of fs.readdirSync(pwRoot).filter((x) => x.startsWith('chromium'))) {
    for (const sub of ['chrome-win64', 'chrome-win']) {
      const p = path.join(pwRoot, d, sub, 'chrome.exe')
      if (fs.existsSync(p)) return p
    }
  }
  throw new Error('chromium not found')
}

const browser = await puppeteer.launch({
  executablePath: pickBrowser(),
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream']
})
const page = await browser.newPage()
const b64 = await page.evaluate(async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  const stream = canvas.captureStream(10)
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' })
  const chunks = []
  rec.ondataavailable = (e) => chunks.push(e.data)
  const done = new Promise((res) => { rec.onstop = res })
  rec.start()
  let t = 0
  const draw = () => {
    t++
    ctx.fillStyle = `hsl(${(t * 4) % 360},70%,50%)`
    ctx.fillRect(0, 0, 320, 180)
    ctx.fillStyle = '#fff'
    ctx.font = '24px sans-serif'
    ctx.fillText(`frame ${t}`, 80, 100)
    if (t < 120) setTimeout(draw, 83)
    else rec.stop()
  }
  draw()
  await done
  const blob = new Blob(chunks, { type: 'video/webm' })
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
})
await browser.close()
fs.writeFileSync('public/demo.webm', Buffer.from(b64, 'base64'))
console.log('demo.webm written:', fs.statSync('public/demo.webm').size, 'bytes')
