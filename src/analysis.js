import { neighbors, collectGroup, boardHash } from "./game.js";
import { moveEvaluationLoss } from "./simple-music.js";

function enclosedAreas(board) {
  const size = board.length, seen = new Set(), territory = [];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const key = y * size + x;
    if (board[y][x] || seen.has(key)) continue;
    const pending = [[x, y]], points = [], borders = new Set();
    while (pending.length) {
      const [cx, cy] = pending.pop(), index = cy * size + cx;
      if (seen.has(index)) continue;
      seen.add(index); points.push([cx, cy]);
      for (const [nx, ny] of neighbors(cx, cy, size)) {
        if (board[ny][nx]) borders.add(board[ny][nx]);
        else if (!seen.has(ny * size + nx)) pending.push([nx, ny]);
      }
    }
    if (borders.size === 1) for (const [px, py] of points) territory.push({ x: px, y: py, color: [...borders][0], strength: 0.5 });
  }
  return territory;
}

export function createAnalysis(game) {
  const computed = new Map(), views = new Map();
  return {
    clear() { computed.clear(); views.clear(); },
    has(position, board) { return computed.get(position)?.signature === boardHash(board); },
    moveImpact(index, previousSignature, currentSignature) {
      const move = game.moves[index];
      if (!move || move.setup.length || (index === game.moves.length - 1 && game.finalSetup.length)) return null;
      const before = computed.get(index), after = computed.get(index + 1);
      if (!before || !after || before.signature !== previousSignature || after.signature !== currentSignature) return null;
      return moveEvaluationLoss(before, after, move.color);
    },
    put(position, board, result) {
      if (!Number.isFinite(result.blackWinrate) || result.blackWinrate < 0 || result.blackWinrate > 1 || result.ownership?.length !== game.size ** 2 || !Array.from(result.ownership).every(Number.isFinite)) throw new Error("KataGo returned an invalid analysis result.");
      computed.set(position, { ...result, signature: boardHash(board) }); views.clear();
    },
    view(board, { source = "recorded", showGraph = false, showTerritory = false, showDead = false } = {}) {
      const position = board.moveNumber;
      const signature = boardHash(board);
      const key = `${position}/${signature}/${source}/${showGraph}/${showTerritory}/${showDead}`;
      if (views.has(key)) return views.get(key);
      const local = computed.get(position);
      const result = local?.signature === signature ? local : null;
      const points = Array.from({ length: game.moves.length + 1 }, (_, i) => source === "katago" ? (computed.has(i) ? computed.get(i).blackWinrate * 100 : null) : (game.analysis[i]?.winrate ?? null));
      let territory = [], dead = [];
      if (source === "recorded") {
        territory = game.analysis[position]?.territory || [];
        dead = territory.filter(({ x, y, color }) => board[y][x] && board[y][x] !== color);
      } else if (source === "enclosed") {
        territory = enclosedAreas(board);
      } else if (result) {
        territory = Array.from(result.ownership, (value, i) => ({ x: i % game.size, y: Math.floor(i / game.size), color: value >= 0 ? "B" : "W", strength: Math.min(1, Math.abs(value)) }));
        const seen = new Set();
        for (let y = 0; y < game.size; y += 1) for (let x = 0; x < game.size; x += 1) {
          if (!board[y][x] || seen.has(y * game.size + x)) continue;
          const group = collectGroup(board, x, y).stones;
          const ownership = group.reduce((sum, [gx, gy]) => sum + result.ownership[gy * game.size + gx], 0) / group.length;
          for (const [gx, gy] of group) seen.add(gy * game.size + gx);
          if ((board[y][x] === "B" ? -ownership : ownership) >= 0.85) for (const [gx, gy] of group) dead.push({ x: gx, y: gy });
        }
      }
      const view = { position, source, points, winrate: points[position], showGraph, territory: showTerritory ? territory : [], dead: showDead ? dead : [], scoreLead: result?.blackScoreLead };
      views.set(key, view);
      if (views.size > 64) views.delete(views.keys().next().value);
      return view;
    },
  };
}

export function drawWinrateGraph(ctx, { x, y, width, height, analysis, colors, positionLabel = "" }) {
  ctx.save();
  ctx.fillStyle = colors.panel; ctx.fillRect(x, y, width, height);
  const padX = width * 0.07, top = y + height * 0.4, bottom = y + height * 0.82;
  const left = x + padX, right = x + width - padX;
  const at = (i, value) => [left + i / Math.max(1, analysis.points.length - 1) * (right - left), bottom - value / 100 * (bottom - top)];
  ctx.font = `500 ${height * 0.17}px system-ui, sans-serif`;
  ctx.fillStyle = colors.text; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  const current = analysis.winrate === null ? "no value at this move" : `${analysis.winrate.toFixed(1)}%`;
  ctx.fillText(`Black win rate · ${current}`, left, y + height * 0.17, (right - left) * (positionLabel ? 0.52 : 1));
  if (positionLabel) {
    ctx.textAlign = "right";
    ctx.font = `650 ${height * 0.19}px system-ui, sans-serif`;
    ctx.fillText(positionLabel, right, y + height * 0.17, (right - left) * 0.44);
  }
  ctx.strokeStyle = colors.muted; ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1, width * 0.001);
  ctx.setLineDash([width * 0.006, width * 0.004]);
  ctx.beginPath(); ctx.moveTo(left, (top + bottom) / 2); ctx.lineTo(right, (top + bottom) / 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = 1; ctx.strokeStyle = colors.accent; ctx.lineWidth = Math.max(1.5, width * 0.002);
  ctx.beginPath(); let connected = false, found = false;
  analysis.points.forEach((point, i) => {
    if (point === null) { connected = false; return; }
    const [px, py] = at(i, point);
    if (connected) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    connected = true; found = true;
  }); ctx.stroke();
  analysis.points.forEach((point, i) => { if (point !== null) { ctx.beginPath(); ctx.arc(...at(i, point), Math.max(1.5, width * 0.002), 0, Math.PI * 2); ctx.fillStyle = colors.accent; ctx.fill(); } });
  const px = at(analysis.position, 0)[0];
  ctx.strokeStyle = colors.text; ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = colors.muted; ctx.font = `400 ${height * 0.14}px system-ui, sans-serif`;
  ctx.textAlign = "right"; ctx.fillText("100", left - width * 0.012, top); ctx.fillText("0", left - width * 0.012, bottom);
  ctx.textAlign = "left"; ctx.fillText("Move 0", left, y + height * 0.93); ctx.textAlign = "right"; ctx.fillText(String(analysis.points.length - 1), right, y + height * 0.93);
  if (!found) { ctx.textAlign = "center"; ctx.fillText("No analysis values available yet", (left + right) / 2, (top + bottom) / 2); }
  ctx.restore();
}
