// Runs every *.check.mjs under src/ as a plain Node script.
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = new URL('..', import.meta.url).pathname
const found = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.check.mjs')) found.push(p)
  }
}
walk(join(root, 'src'))

let failed = 0
for (const file of found) {
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit' })
  if (r.status !== 0) { failed++; console.error(`FAILED ${relative(root, file)}`) }
}
if (failed) process.exit(1)
console.log(`${found.length} check file(s) passed`)
