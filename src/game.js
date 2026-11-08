const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function parseSgf(text) {
  let position = 0;
  let gameCount = 0;
  const stack = [];
  const nodes = [];
  const invalid = () => new Error("Invalid SGF: check the game tree and property values.");
  const skipWhitespace = () => {
    while (position < text.length && /\s/.test(text[position])) position += 1;
  };
  const readValue = () => {
    position += 1;
    let value = "";
    while (position < text.length) {
      const character = text[position++];
      if (character === "]") return value;
      if (character !== "\\") {
        value += character;
        continue;
      }
      if (position >= text.length) throw invalid();
      const escaped = text[position++];
      if (escaped === "\r" || escaped === "\n") {
        const next = text[position];
        if ((escaped === "\r" && next === "\n") || (escaped === "\n" && next === "\r")) position += 1;
      } else {
        value += escaped;
      }
    }
    throw invalid();
  };

  // Walk the collection without recursion, keeping only the first game's main line.
  while (position < text.length) {
    skipWhitespace();
    if (position === text.length) break;
    const character = text[position];
    const parent = stack.at(-1);
    if (character === "(") {
      if (parent && !parent.hasNode) throw invalid();
      const selected = parent ? parent.selected && parent.children === 0 : gameCount === 0;
      if (parent) parent.children += 1;
      else gameCount += 1;
      stack.push({ selected, children: 0, hasNode: false });
      position += 1;
    } else if (character === ")") {
      if (!parent?.hasNode) throw invalid();
      stack.pop();
      position += 1;
    } else if (character === ";") {
      if (!parent || parent.children) throw invalid();
      position += 1;
      parent.hasNode = true;
      const properties = new Map();
      skipWhitespace();
      while (position < text.length && !";()".includes(text[position])) {
        const identifier = text.slice(position).match(/^[A-Z]+/)?.[0];
        if (!identifier || properties.has(identifier)) throw invalid();
        position += identifier.length;
        skipWhitespace();
        const values = [];
        while (text[position] === "[") {
          values.push(readValue());
          skipWhitespace();
        }
        if (!values.length) throw invalid();
        properties.set(identifier, values);
      }
      if (parent.selected) nodes.push(properties);
    } else {
      throw invalid();
    }
  }
  if (stack.length || !nodes.length) throw invalid();

  const root = nodes[0];
  const sizeValue = root.get("SZ")?.[0] ?? "19";
  const size = Number(sizeValue);
  if (!/^\d+$/.test(sizeValue) || !Number.isInteger(size) || size < 2 || size > 52) {
    throw new Error("Supported SGF board sizes are square boards from 2 to 52.");
  }
  if (root.has("GM") && root.get("GM")[0] !== "1") throw new Error("Please choose a Go/Baduk/Weiqi SGF file.");
  const point = (value) => {
    const x = value.length === 2 ? letters.indexOf(value[0]) : -1;
    const y = value.length === 2 ? letters.indexOf(value[1]) : -1;
    if (x < 0 || y < 0 || x >= size || y >= size) throw new Error(`Invalid SGF point "${value}" for a ${size}x${size} board.`);
    return { x, y };
  };
  const initialSetup = [];
  const moves = [];
  const analysis = [];
  let pendingSetup = [];
  for (const node of nodes) {
    const color = node.has("B") ? "B" : node.has("W") ? "W" : null;
    const hasSetup = ["AB", "AW", "AE"].some((property) => node.has(property));
    if ((node.has("B") && node.has("W")) || (color && hasSetup)) throw invalid();
    const setup = [];
    const setupPoints = new Set();
    for (const property of ["AB", "AW", "AE"]) {
      for (const value of node.get(property) || []) {
        const ends = value.split(":");
        if (ends.length > 2) throw invalid();
        const start = point(ends[0]);
        const end = point(ends.at(-1));
        if (start.x > end.x || start.y > end.y) throw invalid();
        for (let y = start.y; y <= end.y; y += 1) {
          for (let x = start.x; x <= end.x; x += 1) {
            const key = `${x},${y}`;
            if (setupPoints.has(key)) throw new Error(`Conflicting SGF setup stones at "${letters[x]}${letters[y]}".`);
            setupPoints.add(key);
            setup.push({ x, y, color: property === "AE" ? null : property[1] });
          }
        }
      }
    }
    if (moves.length) pendingSetup.push(...setup);
    else initialSetup.push(...setup);
    if (color) {
      const values = node.get(color);
      if (values.length !== 1) throw invalid();
      const pass = values[0] === "" || (values[0] === "tt" && size <= 19);
      moves.push({ color, pass, ...(pass ? { x: -1, y: -1 } : point(values[0])), setup: pendingSetup });
      pendingSetup = [];
    }
    if (hasSetup) analysis[moves.length] = { winrate: null, territory: [], player: analysis[moves.length]?.player };
    const annotation = analysis[moves.length] ||= { winrate: null, territory: [] };
    if (["B", "W"].includes(node.get("PL")?.[0])) annotation.player = node.get("PL")[0];
    const winrate = node.get("SBKV")?.[0];
    if (winrate !== undefined && winrate.trim() !== "") {
      const value = Number(winrate);
      if (Number.isFinite(value) && value >= 0 && value <= 100) annotation.winrate = value;
    }
    if (node.has("TB") || node.has("TW")) {
      annotation.territory = [];
      for (const property of ["TB", "TW"]) for (const value of node.get(property) || []) {
        if (!value) continue;
        const ends = value.split(":");
        if (ends.length > 2) throw invalid();
        const start = point(ends[0]), end = point(ends.at(-1));
        if (start.x > end.x || start.y > end.y) throw invalid();
        for (let y = start.y; y <= end.y; y += 1) for (let x = start.x; x <= end.x; x += 1) {
          annotation.territory.push({ x, y, color: property[1] });
        }
      }
    }
  }
  const metadata = (property, fallback = "") => {
    const value = nodes.find((node) => node.has(property))?.get(property)[0];
    return (value?.replace(/\s/g, " ") || fallback).slice(0, 200);
  };
  return {
    raw: text,
    seed: hashText(text),
    size,
    komi: metadata("KM"),
    black: metadata("PB", "Black"),
    white: metadata("PW", "White"),
    blackRank: metadata("BR"),
    whiteRank: metadata("WR"),
    date: metadata("DT"),
    title: metadata("GN"),
    event: metadata("EV"),
    result: metadata("RE"),
    rules: metadata("RU"),
    comment: metadata("GC") || root.get("C")?.[0]?.replace(/\s/g, " ").slice(0, 200) || "",
    charset: root.get("CA")?.[0] || "",
    initialPlayer: root.get("PL")?.[0] === "W" ? "W" : "B",
    analysis,
    initialSetup,
    finalSetup: pendingSetup,
    moves,
  };
}

function cloneBoard(board) {
  const copy = board.map((row) => [...row]);
  copy.placed = board.placed.map((row) => [...row]);
  copy.moveNumber = board.moveNumber;
  copy.lastMove = board.lastMove;
  return copy;
}

// Bounded checkpoints make scrubbing responsive without retaining every board.
export function createReplay(game) {
  const checkpoints = new Map([[0, createBoard(game.size, game.initialSetup)]]);
  return (moveNumber) => {
    const target = Math.max(0, Math.min(game.moves.length, Math.round(Number(moveNumber) || 0)));
    const start = Math.max(...[...checkpoints.keys()].filter((index) => index <= target));
    const board = cloneBoard(checkpoints.get(start));
    for (let i = start; i < target; i += 1) {
      applyMove(board, game.moves[i]);
      if ((i + 1) % 32 === 0) {
        checkpoints.set(i + 1, cloneBoard(board));
        if (checkpoints.size > 64) checkpoints.delete([...checkpoints.keys()].find((key) => key !== 0));
      }
    }
    if (target === game.moves.length) applySetup(board, game.finalSetup);
    return board;
  };
}

export async function readSgfFile(file) {
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose an SGF smaller than 20 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const utf16 = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : null;
  if (utf16) return new TextDecoder(utf16, { fatal: true }).decode(bytes);
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { text = new TextDecoder("windows-1252").decode(bytes); }
  const charset = parseSgf(text).charset;
  if (charset) {
    try { text = new TextDecoder(charset, { fatal: true }).decode(bytes); }
    catch { throw new Error(`Could not decode this SGF's ${charset} character encoding.`); }
  }
  return text;
}

export function applySetup(board, setup = []) {
  for (const { x, y, color } of setup) {
    board[y][x] = color;
    if (board.placed) board.placed[y][x] = 0;
  }
}

export function createBoard(size, setup = []) {
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  board.placed = Array.from({ length: size }, () => Array(size).fill(0));
  board.moveNumber = 0;
  board.lastMove = null;
  applySetup(board, setup);
  return board;
}

export function neighbors(x, y, size) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size);
}

export function collectGroup(board, x, y) {
  const color = board[y][x];
  const stack = [[x, y]];
  const seen = new Set();
  const stones = [];
  const liberties = new Set();

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const key = `${cx},${cy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    stones.push([cx, cy]);

    for (const [nx, ny] of neighbors(cx, cy, board.length)) {
      if (!board[ny][nx]) liberties.add(`${nx},${ny}`);
      if (board[ny][nx] === color) stack.push([nx, ny]);
    }
  }

  return { stones, liberties: liberties.size };
}

export function boardHash(board) {
  return board.map((row) => row.map((stone) => stone || ".").join("")).join("/");
}

export function applyMove(board, move) {
  applySetup(board, move.setup);
  board.moveNumber += 1;
  board.lastMove = move;
  if (move.pass || board[move.y]?.[move.x]) return { captures: 0, capturedStones: [], ownLiberties: 0, koLike: false };
  board[move.y][move.x] = move.color;
  board.placed[move.y][move.x] = board.moveNumber;
  const opponent = move.color === "B" ? "W" : "B";
  let captures = 0;
  const capturedStones = [];

  for (const [nx, ny] of neighbors(move.x, move.y, board.length)) {
    if (board[ny][nx] !== opponent) continue;
    const group = collectGroup(board, nx, ny);
    if (group.liberties === 0) {
      captures += group.stones.length;
      group.stones.forEach(([sx, sy]) => {
        capturedStones.push([sx, sy]);
        board[sy][sx] = null;
        board.placed[sy][sx] = 0;
      });
    }
  }

  const ownGroup = collectGroup(board, move.x, move.y);
  const ownLiberties = ownGroup.liberties;
  if (ownGroup.liberties === 0) {
    ownGroup.stones.forEach(([sx, sy]) => {
      board[sy][sx] = null;
      board.placed[sy][sx] = 0;
    });
  }

  return { captures, capturedStones, ownLiberties, koLike: captures === 1 && ownGroup.stones.length === 1 && ownLiberties === 1 };
}


// Exact ternary board keys match the upstream feature extractor's superko encoding.
function repetitionKey(board, player) {
  let key = `${player[0]}|${board.length}:`, packed = 0, count = 0;
  for (const row of board) for (const stone of row) {
    packed = packed * 3 + (stone === "B" ? 1 : stone === "W" ? 2 : 0);
    if (++count === 3) { key += String.fromCharCode(65 + packed); packed = 0; count = 0; }
  }
  if (count) key += String.fromCharCode(65 + packed * 3 ** (3 - count));
  return key;
}

export function createEnginePosition(game, getBoard, position, komi, rules) {
  const convert = (board) => board.map((row) => row.map((stone) => stone === "B" ? "black" : stone === "W" ? "white" : null));
  const nextPlayer = (index) => (game.analysis[index]?.player || game.moves[index]?.color || (game.moves[index - 1]?.color === "B" ? "W" : game.moves[index - 1]?.color === "W" ? "B" : game.initialPlayer)) === "B" ? "black" : "white";
  const board = getBoard(position);
  const editedFinal = position === game.moves.length && game.finalSetup.length > 0;
  const start = editedFinal ? position : Math.max(0, game.moves.slice(0, position).findLastIndex((move) => move.setup.length));
  const history = game.moves.slice(start, position).map((move) => ({ x: move.x, y: move.y, player: move.color === "B" ? "black" : "white" }));
  let previousBoard, previousPreviousBoard;
  if (history.length) {
    const previous = getBoard(position - 1); applySetup(previous, game.moves[position - 1].setup);
    previousBoard = convert(previous);
    if (history.length >= 2) previousPreviousBoard = convert(getBoard(position - 2));
  }
  const repetitionHistory = [];
  if (["aga", "new-zealand", "tromp-taylor"].includes(rules)) {
    for (let i = start; i <= position; i += 1) {
      const historical = getBoard(i);
      if (i === start && i < position) applySetup(historical, game.moves[i].setup);
      repetitionHistory.push(repetitionKey(historical, nextPlayer(i)));
    }
  }
  return { board: convert(board), previousBoard, previousPreviousBoard, currentPlayer: nextPlayer(position), moveHistory: history, repetitionHistory, komi, rules };
}
