// 把小程序里的图片素材同步到 public/，网页版与小程序共用同一份素材
import { cpSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mp = resolve(root, '../miniprogram')
const pub = resolve(root, 'public')

for (const dir of ['assets', 'tarot/cards']) {
  mkdirSync(resolve(pub, dir), { recursive: true })
  cpSync(resolve(mp, dir), resolve(pub, dir), { recursive: true })
}
console.log('assets synced')
