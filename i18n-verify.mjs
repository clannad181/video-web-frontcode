// 全量校验：
// 1) 源码里用到的每个 $t()/t() key 是否在 src/locales/messages/*.js 中有定义
// 2) 多个翻译文件之间的 key 冲突（同一个中文 key，英文值不一致）
import fs from 'node:fs'
import path from 'node:path'

const MSG_DIR = 'src/locales/messages'
const roots = ['src/views', 'src/layouts', 'src/components', 'src/stores', 'src/router', 'src/utils']

function walk(p, out = []) {
  if (!fs.existsSync(p)) return out
  if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f), out)
  else if (/\.(vue|js)$/.test(p)) out.push(p)
  return out
}

// 载入翻译文件（用 import 以便正确解析转义）
const msgs = {}
for (const f of fs.readdirSync(MSG_DIR)) {
  if (!f.endsWith('.js')) continue
  const mod = await import('./' + path.join(MSG_DIR, f).replace(/\\/g, '/'))
  msgs[f] = mod.default || {}
}

const merged = {}
const owners = {}
const conflicts = []
for (const [file, obj] of Object.entries(msgs)) {
  for (const [k, v] of Object.entries(obj)) {
    if (k in merged && merged[k] !== v) conflicts.push({ key: k, a: [owners[k], merged[k]], b: [file, v] })
    if (!(k in merged)) { merged[k] = v; owners[k] = file }
  }
}

// 扫描源码用到的 key
const files = roots.flatMap(r => walk(r))
const used = new Map() // key -> Set(file)
const KEY_RE = /(?:^|[^\w$])\$?t\(\s*(['"])((?:[^\\]|\\.)*?)\1/g
const KEYPATH_RE = /keypath="((?:[^"])*)"/g
const MARKER_RE = /\/\/\s*i18n-key/

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const rel = file.replace(/\\/g, '/')
  for (const m of src.matchAll(KEY_RE)) {
    const k = m[2]
    if (!/[\u4e00-\u9fa5]/.test(k) && !k.includes('{')) continue
    if (!used.has(k)) used.set(k, new Set())
    used.get(k).add(rel)
  }
  for (const m of src.matchAll(KEYPATH_RE)) {
    const k = m[1]
    if (!used.has(k)) used.set(k, new Set())
    used.get(k).add(rel + ' (i18n-t keypath)')
  }
  // // i18n-key 标注行里的中文字面量（动态消费的 key）
  for (const line of src.split('\n')) {
    if (!MARKER_RE.test(line)) continue
    for (const m of line.matchAll(/'([^'\n]*[\u4e00-\u9fa5][^'\n]*)'|"([^"\n]*[\u4e00-\u9fa5][^"\n]*)"/g)) {
      const k = m[1] ?? m[2]
      if (!k) continue
      if (!used.has(k)) used.set(k, new Set())
      used.get(k).add(rel + ' (i18n-key)')
    }
  }
}

// 路由 meta.title 也是动态 key（侧栏/面包屑渲染时翻译），必须有英文
const routerSrc = fs.readFileSync('src/router/index.js', 'utf8')
for (const m of routerSrc.matchAll(/title:\s*'([^']+)'/g)) {
  const k = m[1]
  if (!/[一-龥]/.test(k)) continue
  if (!used.has(k)) used.set(k, new Set())
  used.get(k).add('src/router/index.js (meta.title)')
}

// 基础语言包里的 key（common.* / menu.* 等语义 key）
const base = (await import('./src/locales/zh-cn.js')).default
const baseKeys = new Set()
const collect = o => { for (const [k, v] of Object.entries(o)) { if (typeof v === 'object' && v) collect(v); else baseKeys.add(k) } }
collect(base)

const missing = []
const markerMissing = []
for (const [k, where] of used) {
  if (merged[k] !== undefined) continue
  if (baseKeys.has(k)) continue
  if (k.includes('{') && !/[\u4e00-\u9fa5]/.test(k)) continue // 纯参数 key
  const entry = { key: k, where: [...where] }
  const calledFromSource = [...where].some(w => !w.includes('i18n-key'))
  if (calledFromSource) missing.push(entry)
  else markerMissing.push(entry)
}

console.log(`翻译文件 ${Object.keys(msgs).length} 个，合并后 ${Object.keys(merged).length} 条 key`)
console.log(`源码用到 key ${used.size} 条\n`)

if (missing.length) {
  console.log(`✗ 缺失翻译 ${missing.length} 条：`)
  for (const m of missing) console.log(`  [${m.key}]  <- ${m.where.join(', ')}`)
} else console.log('✓ 所有 $t()/t() key 均有翻译')

if (markerMissing.length) {
  console.log(`\n· i18n-key 标注但未翻译 ${markerMissing.length} 条（数据/正则/后缀等，回显中文属预期）：`)
  for (const m of markerMissing) console.log(`  [${m.key}]  <- ${m.where.join(', ')}`)
}

console.log('')
if (conflicts.length) {
  console.log(`✗ 跨文件冲突 ${conflicts.length} 条：`)
  for (const c of conflicts) console.log(`  [${c.key}]  ${c.a[0]}="${c.a[1]}"  vs  ${c.b[0]}="${c.b[1]}"`)
} else console.log('✓ 无跨文件冲突')

const unused = Object.keys(merged).filter(k => !used.has(k))
console.log(`\n未被源码引用的 key：${unused.length} 条`, unused.length ? unused : '')

process.exit(missing.length || conflicts.length ? 1 : 0)
