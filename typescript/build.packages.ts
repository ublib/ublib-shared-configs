/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import path from 'node:path'

import { t } from 'chainsi'
import { bundle } from 'dts-bundle'
import { build } from 'esbuild'
import { rimraf } from 'rimraf'

function finishedBuild(dir: string) {
  return console.log(`${t('✔︎').green._} build: ${t(dir).blue._}`)
}

const PACKAGES: Record<string, { external?: string[] }> = {
  // TODO:
}

export function buildMain() {
  execSync('tsc -p tsconfig.build.json')

  const promises = Object.entries(PACKAGES).map(async ([pkg, { external }]) => {
    const res = await build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      minify: true,
      target: 'es2018',
      outdir: `packages/${pkg}/dist`,
      external,
      format: 'esm',
      plugins: [
        {
          name: 'TypeScriptDeclarationsPlugin',
          setup(build: any) {
            build.onEnd(() => {
              bundle({
                name: pkg,
                main: `temp/packages/${pkg}/src/index.d.ts`,
                out: path.resolve(`packages/${pkg}/dist/index.d.ts`),
              })
            })
          },
        },
      ],
    })
    finishedBuild(`packages/${pkg}/dist`)
    return res
  })
  return promises
}

export function clearMain() {
  return Object.entries(PACKAGES)
    .map(([pkg]) => `packages/${pkg}/dist`)
    .map(dir => rimraf(dir))
}

(async function main() {
  console.log('clear dist...')
  await Promise.allSettled([...clearMain()])
  console.log(`${t('✔︎').green._} finished clearing dist`)
  console.log('building...')
  const buildingMain = buildMain()
  await Promise.all([...buildingMain])
  execSync('rm -rf temp')
})()
