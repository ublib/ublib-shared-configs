/**
 * @type {import('esbuild').BuildOptions}
*/
export default {
  entryPoints: [], // TODO:
  bundle: true,
  minify: true,
  target: "es2018",
  outdir: `dist`, // TODO:
  format: "esm",
}
