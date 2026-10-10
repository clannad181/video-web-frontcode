// i18n 静态检查：找出还没包 $t()/t() 的中文（注释与 console 日志除外）
// 用法：node i18n-check.mjs [文件...]
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_ROOTS = ['src/views', 'src/layouts', 'src/components', 'src/utils', 'src/stores']
const CJK = /[\u4e00-\u9fa5]/
const QUOTED = /'([^'\\\n]|\\.)*'|"([^"\\\n]|\\.)*"/g

function walk(p, out = []) {
  if (!fs.existsSync(p)) return out
  if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f), out)
  else if (/\.(vue|js)$/.test(p)) out.push(p)
  return out
}

function stripComments(line) {
  let s = line
  s = s.replace(/<!--.*?-->/g, '')
  const q = s.search(/\/\/(?![^\s'"]*['"][^'"]*$)/) // 粗略：行内 // 注释（避免误伤 http://）
  if (q >= 0 && !/https?:$/.test(s.slice(Math.max(0, q - 8), q + 2))) s = s.slice(0, q)
  return s
}

function isWrapped(prefix) {
  const last3 = prefix.slice(-3)
  if (last3 === '$t(') return true
  if (/[^A-Za-z0-9_$]t\($/.test(last3)) return true
  return false
}

const args = process.argv.slice(2)
const files = args.length ? args.map(a => path.resolve(a)) : DEFAULT_ROOTS.flatMap(r => walk(path.resolve(process.cwd(), r)))

let bad = 0
let clean = 0
const problems = []

for (const file of files) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  let prevTail = ''
  const hits = []
  lines.forEach((raw, i) => {
    const t = raw.trim()
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) { prevTail = ''; return }
    if (raw.includes('console.')) { prevTail = ''; return }
    if (raw.includes('i18n-key')) { prevTail = ''; return } // 行尾标注：该中文字面量本身就是翻译 key，由别处 $t() 消费
    const line = stripComments(raw)
    if (!CJK.test(line)) {
      const tail = line.trim().slice(-4)
      prevTail = /(\$?t\()$/.test(tail) ? line.trim().slice(-3) : ''
      return
    }
    // 1) 引号内中文，必须紧跟 $t(/t(
    QUOTED.lastIndex = 0
    let m
    const flagged = []
    const stripped = line.replace(QUOTED, (s, ...rest) => {
      const offset = rest[rest.length - 2]
      if (CJK.test(s)) {
        const prefix = line.slice(0, offset)
        const inner = s.slice(1, -1)
        const ok = isWrapped(prefix) ||
          /^\$?(?:t|tm|te|rt)\(/.test(inner) || // 形如 "$t('中文')"
          (prefix.trim() === '' && /(\$?t\()$/.test(prevTail))
        if (!ok) flagged.push(s)
      }
      return '""'
    })
    // 2) 引号外的中文 = 模板纯文本，必须改成 {{ $t('...') }}
    if (CJK.test(stripped)) {
      const left = stripped.replace(/\{\{|\}\}/g, '').trim()
      if (CJK.test(left)) flagged.push('【模板纯文本】' + left.slice(0, 40))
    }
    if (flagged.length) hits.push(`  L${i + 1}: ${flagged.join('  |  ')}`)
    prevTail = /(\$?t\()$/.test(line.trim().slice(-3)) ? line.trim().slice(-3) : ''
  })
  if (hits.length) { bad += hits.length; problems.push(`\n✗ ${rel}`); problems.push(...hits) }
  else clean++
}

if (problems.length) console.log(problems.join('\n'))
console.log(`\n未通过 ${bad} 处，已通过 ${clean} 个文件`)
process.exit(bad ? 1 : 0)
