import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('assets/katago/', root);
await mkdir(output, { recursive: true });
await build({
  absWorkingDir: fileURLToPath(root), entryPoints: ['scripts/katago-worker.ts'],
  outfile: fileURLToPath(new URL('worker.js', output)), bundle: true, minify: true,
  format: 'iife', platform: 'browser', target: 'es2022', legalComments: 'linked',
  banner: { js: '/* Local KataGo neural evaluation. Upstream sources and licenses: vendor/web-katrain and THIRD_PARTY_NOTICES.md. */' },
});
for (const name of ['tfjs-backend-wasm.wasm', 'tfjs-backend-wasm-simd.wasm', 'tfjs-backend-wasm-threaded-simd.wasm']) {
  await copyFile(new URL('node_modules/@tensorflow/tfjs-backend-wasm/dist/' + name, root), new URL(name, output));
}
console.log('Built the lazy-loaded KataGo worker and WASM backends.');
