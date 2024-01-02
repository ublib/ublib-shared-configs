import path from "node:path";
import { execSync } from "node:child_process";

import { build } from "esbuild";
import { rimraf } from "rimraf";
import { bundle } from "dts-bundle";
import { t } from "chainsi";

const finishedBuild = (dir: string) =>
  console.log(`${t("✔︎").green._} build: ${t(dir).blue._}`);

export const buildMain = async () => {
  execSync("tsc -p tsconfig.build.json");

  const res = await build({
    entryPoints: [path.resolve(`src/index`)],
    bundle: true,
    minify: true,
    target: "es2018",
    outdir: `dist`,
    external: [], // TODO:
    format: "esm",
    plugins: [
      {
        name: "TypeScriptDeclarationsPlugin",
        setup(build: any) {
          build.onEnd(() => {
            bundle({
              name: "", // TODO:
              main: `temp/src/index.d.ts`,
              out: path.resolve(`dist/index.d.ts`),
            });
          });
        },
      },
    ],
  });
  finishedBuild(`dist`);
  return res;
};

export const clearMain = () => rimraf("dist");

await (async function main() {
  console.log("clear dist...");
  await Promise.allSettled([clearMain()]);
  console.log(`${t("✔︎").green._} finished clearing dist`);
  console.log("building...");
  const buildingMain = buildMain();
  await Promise.all([buildingMain]);
  execSync("rm -rf temp");
})();
