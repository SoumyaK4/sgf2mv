import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths, setThreadsCount } from '@tensorflow/tfjs-backend-wasm';
import { parseKataGoModelV8 } from '../vendor/web-katrain/src/engine/katago/loadModelV8';
import { KataGoModelV8Tf } from '../vendor/web-katrain/src/engine/katago/modelV8';
import { fillInputsV7FastForPosition } from '../vendor/web-katrain/src/engine/katago/positionInputsV7';
import { setBoardSize } from '../vendor/web-katrain/src/engine/katago/fastBoard';
import { postprocessKataGoV8 } from '../vendor/web-katrain/src/engine/katago/evalV8';

type Position = Omit<Parameters<typeof fillInputsV7FastForPosition>[0], 'outSpatial' | 'outGlobal' | 'conservativePassAndIsRoot'>;
let model: KataGoModelV8Tf | null = null;
async function init(buffer: ArrayBuffer, wasmBase: string) {
  const bytes = new Uint8Array(await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const parsed = parseKataGoModelV8(bytes);
  setWasmPaths(wasmBase); setThreadsCount(1); tf.enableProdMode();
  const backends = typeof navigator !== 'undefined' && 'gpu' in navigator ? ['webgpu', 'wasm'] : ['wasm'];
  const errors: string[] = [];
  for (const backend of backends) {
    let candidate: KataGoModelV8Tf | null = null;
    try {
      if (!(await tf.setBackend(backend))) throw new Error('backend unavailable');
      await tf.ready(); candidate = new KataGoModelV8Tf(parsed);
      const spatial = tf.zeros([1, 19, 19, 22]) as tf.Tensor4D, global = tf.zeros([1, 19]) as tf.Tensor2D;
      let out: ReturnType<KataGoModelV8Tf['forwardValueOnly']> | null = null;
      try { out = candidate.forwardValueOnly(spatial, global); await out.value.data(); await out.scoreValue.data(); }
      finally { tf.dispose([spatial, global, ...(out ? [out.value, out.scoreValue] : [])]); }
      model?.dispose(); model = candidate;
      return { backend, modelName: parsed.modelName, modelVersion: parsed.modelVersion };
    } catch (error) { candidate?.dispose(); errors.push(`${backend}: ${String(error)}`); }
  }
  throw new Error('Could not initialize local KataGo. ' + errors.join('; '));
}

async function analyze(position: Position) {
  if (!model) throw new Error('KataGo is not loaded.');
  const size = position.board.length;
  if (!Number.isInteger(size) || size < 2 || size > 19 || position.board.some((row) => row.length !== size)) throw new Error('KataGo supports square boards from 2 to 19.');
  setBoardSize(size);
  const spatial = new Float32Array(size * size * 22), global = new Float32Array(19);
  fillInputsV7FastForPosition({ ...position, conservativePassAndIsRoot: true, outSpatial: spatial, outGlobal: global });
  const input = tf.tensor4d(spatial, [1, size, size, 22]), globals = tf.tensor2d(global, [1, 19]);
  let out: ReturnType<KataGoModelV8Tf['forward']> | null = null;
  try {
    out = model.forward(input, globals);
    const [value, score, rawOwnership] = await Promise.all([out.value.data(), out.scoreValue.data(), out.ownership.data()]);
    const evaluation = postprocessKataGoV8({ nextPlayer: position.currentPlayer, valueLogits: value, scoreValue: score, postProcessParams: model.postProcessParams, modelVersion: model.modelVersion });
    const sign = position.currentPlayer === 'black' ? 1 : -1;
    const ownership = Float32Array.from(rawOwnership, (value) => sign * Math.tanh(value * model!.postProcessParams.outputScaleMultiplier));
    return { ownership, blackWinrate: evaluation.blackWinProb, blackScoreLead: evaluation.blackScoreLead };
  } finally { tf.dispose([input, globals, ...(out ? [out.policy, out.policyPass, out.value, out.scoreValue, out.ownership] : [])]); }
}

let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    try {
      const result = data.type === 'init' ? await init(data.model, data.wasmBase) : await analyze(data.position);
      self.postMessage({ id: data.id, type: 'result', result }, 'ownership' in result ? [result.ownership.buffer] : []);
    } catch (error) { self.postMessage({ id: data.id, type: 'error', message: error instanceof Error ? error.message : String(error) }); }
  });
};
