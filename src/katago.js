import { sha256Hex } from "./sha256.js";

// Runtime and pinned weights are served locally and fetched only on explicit request.
const modelUrl = new URL("../assets/katago/g170e-b10c128-s1141046784-d204142634.bin.gz", import.meta.url).href;
const modelSha256 = "1a8e05a4ea3fca20dab79410cbb566c760767fcdd2fa0b701cfe259a84cc8b04";
async function validateModel(buffer) {
  const sha = await sha256Hex(buffer);
  if (sha !== modelSha256) throw new Error("The KataGo model failed its integrity check. Clear the model cache and retry.");
  return buffer;
}
const cacheName = "sgf2mv-katago-models-v1";

async function downloadModel(signal, progress) {
  progress("Connecting to the KataGo model download…", null);
  let cache = null;
  try { cache = await caches.open(cacheName); } catch { /* Caching is optional. */ }
  const cached = cache ? await cache.match(modelUrl) : null;
  if (cached) {
    progress("Loading cached KataGo model…", 1);
    try { return await validateModel(await cached.arrayBuffer()); }
    catch { await cache.delete(modelUrl); }
  }
  const response = await fetch(modelUrl, { signal });
  if (!response.ok) throw new Error(`KataGo model download failed (${response.status}).`);
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader(), chunks = []; let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); received += value.length;
    progress(`Downloading KataGo model: ${(received / 1048576).toFixed(1)} MB${total ? ` of ${(total / 1048576).toFixed(1)} MB` : ""}`, total ? received / total : null);
  }
  const bytes = new Uint8Array(received); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) throw new Error("The model download was not a KataGo gzip file.");
  await validateModel(bytes.buffer);
  if (cache) { try { await cache.put(modelUrl, new Response(bytes, { headers: { "Content-Type": "application/gzip" } })); } catch { /* A full cache must not block analysis. */ } }
  return bytes.buffer;
}

export class KataGoClient {
  constructor() { this.worker = null; this.pending = new Map(); this.nextId = 0; this.ready = false; this.details = null; }
  stop() {
    this.worker?.terminate(); this.worker = null; this.ready = false;
    for (const { reject } of this.pending.values()) reject(new DOMException("Analysis cancelled", "AbortError"));
    this.pending.clear();
  }
  request(type, payload, transfer = [], signal) {
    signal?.throwIfAborted();
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const cancel = () => this.stop();
      signal?.addEventListener("abort", cancel, { once: true });
      const finish = (fn) => (value) => { signal?.removeEventListener("abort", cancel); fn(value); };
      this.pending.set(id, { resolve: finish(resolve), reject: finish(reject) });
      try { this.worker.postMessage({ type, id, ...payload }, transfer); }
      catch (error) { this.pending.delete(id); finish(reject)(error); }
    });
  }
  async load({ signal, onProgress = () => {} } = {}) {
    if (this.ready) return this.details;
    const model = await downloadModel(signal, onProgress);
    signal?.throwIfAborted();
    onProgress("Starting the local KataGo runtime…", null);
    this.stop();
    this.worker = new Worker(new URL("../assets/katago/worker.js", import.meta.url));
    this.worker.onmessage = ({ data }) => {
      const pending = this.pending.get(data.id);
      if (!pending) return;
      this.pending.delete(data.id);
      if (data.type === "error") pending.reject(new Error(data.message)); else pending.resolve(data.result);
    };
    this.worker.onerror = (event) => {
      event.preventDefault();
      const error = new Error(event.message || "KataGo worker failed to start.");
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear(); this.worker?.terminate(); this.worker = null; this.ready = false;
    };
    try {
      this.details = await this.request("init", { model, wasmBase: new URL("../assets/katago/", import.meta.url).href }, [model], signal);
      this.ready = true;
      onProgress(`KataGo ready · ${this.details.backend} · ${this.details.modelName}`, 1);
      return this.details;
    } catch (error) { this.stop(); throw error; }
  }
  async analyze(position, signal) {
    if (!this.ready) throw new Error("Download and load KataGo before analyzing.");
    if (position.board.length > 19) throw new Error("The local KataGo model supports boards up to 19×19. Recorded analysis remains available for larger boards.");
    return this.request("analyze", { position }, [], signal);
  }
}

export function engineRules(value) {
  const name = value.toLowerCase().replace(/[^a-z]/g, "");
  if (!name || name.includes("japan")) return "japanese";
  if (name.includes("chin")) return "chinese";
  if (name === "tt" || name.includes("tromp") || name.includes("taylor")) return "tromp-taylor";
  if (name.includes("newzealand") || name === "nz") return "new-zealand";
  if (name.includes("aga")) return "aga";
  if (name.includes("korean")) return "korean";
  throw new Error(`KataGo does not recognize the rules “${value}”. Choose Japanese, Chinese, Korean, AGA, New Zealand or Tromp-Taylor in Game Details.`);
}
