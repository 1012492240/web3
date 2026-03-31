/**
 * Builds messages/ar.json from en.json using Google Translate (unofficial API).
 * Run: node scripts/build-ar-json.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { translate } from '@vitalets/google-translate-api'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const enPath = path.join(root, 'messages/en.json')
const mapPath = path.join(root, 'messages/ar-string-map.json')
const outPath = path.join(root, 'messages/ar.json')

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))

const set = new Set()
;(function walk(v) {
  if (typeof v === 'string') set.add(v)
  else if (Array.isArray(v)) v.forEach(walk)
  else if (v && typeof v === 'object') Object.values(v).forEach(walk)
})(en)

const unique = [...set]
let map = {}
if (fs.existsSync(mapPath)) {
  try {
    map = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  } catch {
    map = {}
  }
}

async function trString(s) {
  if (map[s]) return map[s]
  let attempt = 0
  while (attempt < 4) {
    try {
      const res = await translate(s, { from: 'en', to: 'ar' })
      map[s] = res.text
      return res.text
    } catch (e) {
      attempt++
      await new Promise((r) => setTimeout(r, 400 * attempt))
      if (attempt >= 4) {
        console.error('SKIP after retries:', s.slice(0, 80))
        map[s] = s
        return s
      }
    }
  }
  return s
}

async function main() {
  const pending = unique.filter((s) => !map[s] || map[s] === s)
  console.log('Total unique strings:', unique.length, '| Already cached:', unique.length - pending.length, '| To translate:', pending.length)

  let i = 0
  for (const s of pending) {
    await trString(s)
    i++
    if (i % 25 === 0) {
      fs.writeFileSync(mapPath, JSON.stringify(map, null, 2))
      console.log('Progress', i, '/', pending.length)
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2))

  function apply(obj) {
    if (typeof obj === 'string') return map[obj] ?? obj
    if (Array.isArray(obj)) return obj.map(apply)
    if (obj && typeof obj === 'object') {
      const o = {}
      for (const k of Object.keys(obj)) o[k] = apply(obj[k])
      return o
    }
    return obj
  }

  const ar = apply(JSON.parse(JSON.stringify(en)))
  fs.writeFileSync(outPath, JSON.stringify(ar, null, 2) + '\n')
  console.log('Wrote', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
