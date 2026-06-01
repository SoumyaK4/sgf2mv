const fileInput = document.querySelector("#fileInput");
const playButton = document.querySelector("#playButton");
const stopButton = document.querySelector("#stopButton");
const renderButton = document.querySelector("#renderButton");
const paceInput = document.querySelector("#paceInput");
const volumeInput = document.querySelector("#volumeInput");
const legatoInput = document.querySelector("#legatoInput");
const droneInput = document.querySelector("#droneInput");
const sectionPacingInput = document.querySelector("#sectionPacingInput");
const rangeEditor = document.querySelector("#rangeEditor");
const rangeList = document.querySelector("#rangeList");
const addRangeButton = document.querySelector("#addRangeButton");
const sustainList = document.querySelector("#sustainList");
const addSustainButton = document.querySelector("#addSustainButton");
const connectionInput = document.querySelector("#connectionInput");
const textureStyleInput = document.querySelector("#textureStyleInput");
const structureInput = document.querySelector("#structureInput");
const sizeInput = document.querySelector("#sizeInput");
const instrumentInput = document.querySelector("#instrumentInput");
const blackInstrumentInput = document.querySelector("#blackInstrumentInput");
const whiteInstrumentInput = document.querySelector("#whiteInstrumentInput");
const scaleInput = document.querySelector("#scaleInput");
const chordInput = document.querySelector("#chordInput");
const musicModeInput = document.querySelector("#musicModeInput");
const neighborhoodInput = document.querySelector("#neighborhoodInput");
const registerInput = document.querySelector("#registerInput");
const textureInput = document.querySelector("#textureInput");
const noteLengthInput = document.querySelector("#noteLengthInput");
const regionRows = [...document.querySelectorAll(".region-row")];
const statusEl = document.querySelector("#status");
const metaEl = document.querySelector("#gameMeta");
const downloadLink = document.querySelector("#downloadLink");
const canvas = document.querySelector("#boardCanvas");
const ctx = canvas.getContext("2d");
const settingsGroups = [...document.querySelectorAll(".settings-group")];
const hirajoshiPitchClasses = [2, 3, 7, 9, 10];
const noteLabelToMidi = {
  C: 0,
  Cs: 1,
  Db: 1,
  D: 2,
  Ds: 3,
  Eb: 3,
  E: 4,
  F: 5,
  Fs: 6,
  Gb: 6,
  G: 7,
  Gs: 8,
  Ab: 8,
  A: 9,
  As: 10,
  Bb: 10,
  B: 11,
};
const gotoMusicScale = [
  { index: 1, label: "G3", midi: 55 },
  { index: 2, label: "A3", midi: 57 },
  { index: 3, label: "Bb3", midi: 58 },
  { index: 4, label: "D4", midi: 62 },
  { index: 5, label: "Eb4", midi: 63 },
  { index: 6, label: "G4", midi: 67 },
  { index: 7, label: "A4", midi: 69 },
  { index: 8, label: "Bb4", midi: 70 },
  { index: 9, label: "D5", midi: 74 },
  { index: 10, label: "Eb5", midi: 75 },
  { index: 11, label: "G5", midi: 79 },
  { index: 12, label: "A5", midi: 81 },
  { index: 13, label: "Bb5", midi: 82 },
  { index: 14, label: "D6", midi: 86 },
  { index: 15, label: "Eb6", midi: 87 },
  { index: 16, label: "G6", midi: 91 },
  { index: 17, label: "A6", midi: 93 },
  { index: 18, label: "Bb6", midi: 94 },
];

let loadedGame = null;
let playbackAbort = { cancelled: false };
let activeAudio = null;
let activeRecorder = null;

const letters = "abcdefghijklmnopqrstuvwxyz";
const scaleModes = {
  "korean-pentatonic": [7, 9, 10, 2, 3],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};
const chordModes = {
  none: [],
  triad: [0, 2, 4],
  seventh: [0, 2, 4, 6],
  sus2: [0, 1, 4],
  sus4: [0, 3, 4],
};
const moodProfiles = {
  neutral: { label: "None", pace: 1, duration: 1, overlap: 1, attack: 1, release: 1, brightness: 1, volume: 1 },
  happy: { label: "Happy", pace: 0.88, duration: 0.9, overlap: 0.82, attack: 0.82, release: 0.86, brightness: 1.22, volume: 1.02 },
  excited: { label: "Excited", pace: 0.72, duration: 0.78, overlap: 0.62, attack: 0.62, release: 0.72, brightness: 1.34, volume: 1.08 },
  angry: { label: "Angry", pace: 0.78, duration: 0.72, overlap: 0.48, attack: 0.5, release: 0.58, brightness: 0.78, volume: 1.18 },
  tragic: { label: "Tragic", pace: 1.32, duration: 1.32, overlap: 1.42, attack: 1.45, release: 1.55, brightness: 0.7, volume: 0.92 },
  confused: { label: "Confused", pace: 1.05, duration: 0.86, overlap: 0.72, attack: 1.16, release: 0.9, brightness: 1.08, volume: 0.92 },
  nervous: { label: "Nervous", pace: 0.66, duration: 0.58, overlap: 0.38, attack: 0.48, release: 0.5, brightness: 1.18, volume: 0.86 },
  cinematic: { label: "Cinematic", pace: 1.18, duration: 1.22, overlap: 1.38, attack: 1.28, release: 1.42, brightness: 0.92, volume: 1.03 },
  melancholy: { label: "Melancholy", pace: 1.2, duration: 1.2, overlap: 1.22, attack: 1.22, release: 1.28, brightness: 0.82, volume: 0.88 },
  sad: { label: "Sad", pace: 1.28, duration: 1.14, overlap: 1.16, attack: 1.28, release: 1.24, brightness: 0.76, volume: 0.82 },
};
const noteNames = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
const displayNoteNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const sampleNameToMidi = (name) => {
  const match = name.match(/^([A-G]s?)(-?\d+)$/);
  if (!match) return null;
  return noteNames.indexOf(match[1]) + (Number(match[2]) + 1) * 12;
};
const instrumentSampleNames = {
  piano:
    "C1 Cs1 D1 Ds1 E1 F1 Fs1 G1 Gs1 A1 As1 B1 C2 Cs2 D2 Ds2 E2 F2 Fs2 G2 Gs2 A2 As2 B2 C3 Cs3 D3 Ds3 E3 F3 Fs3 G3 Gs3 A3 As3 B3 C4 Cs4 D4 Ds4 E4 F4 Fs4 G4 Gs4 A4 As4 B4 C5 Cs5 D5 Ds5 E5 F5 Fs5 G5 Gs5 A5 As5 B5 C6 Cs6 D6 Ds6 E6 F6 Fs6 G6 Gs6 A6 As6 B6 C7 Cs7 D7 Ds7 E7 F7 Fs7 G7 Gs7 A7 As7 B7 C8",
  guitar:
    "B1 Cs2 D2 Ds2 E2 F2 Fs2 G2 Gs2 A2 As2 B2 C3 Cs3 D3 Ds3 E3 F3 Fs3 G3 Gs3 A3 As3 B3 C4 Cs4 D4 Ds4 E4 F4 Fs4 G4 Gs4 A4 As4 B4 C5 Cs5 D5 Ds5 E5 Fs5 G5 Gs5 A5 As5 C6",
  harp: "E1 G1 B1 D2 F2 A2 C3 E3 G3 B3 D4 F4 A4 C5 E5 G5 B5 D6 F6 A6 B6 D7 F7",
  cello:
    "C2 D2 Ds2 E2 F2 G2 Gs2 A2 As2 B2 C3 Cs3 D3 Ds3 E3 F3 Fs3 G3 Gs3 A3 As3 B3 C4 Cs4 D4 Ds4 E4 F4 Fs4 G4 Gs4 A4 B4 C5",
  violin: "A3 C4 E4 G3 G4 A4 C5 E5 G5 A5 C6 E6 G6 A6 C7",
  flute: "C4 E4 A4 C5 E5 A5 C6 E6 A6 C7",
  contrabass: "Fs1 G1 As1 C2 D2 E2 Fs2 Gs2 A2 Cs3 E3 Gs3 B3",
};
const melodicInstrumentNames = Object.keys(instrumentSampleNames);
const percussionSamples = {
  "agogo bells": "agogo bells/agogo-bells__025_mezzo-forte_struck-singly.mp3",
  "bass drum": "bass drum/bass-drum__1_mezzo-forte_bass-drum-mallet.mp3",
  "snare drum": "snare drum/snare-drum__025_mezzo-forte_with-snares.mp3",
  tambourine: "tambourine/tambourine__025_forte_hand.mp3",
  triangle: "triangle/triangle__long_piano_struck-singly.mp3",
  "suspended cymbal": "suspended cymbal/suspended-cymbal__05_mezzo-forte_damped.mp3",
  "sleigh bells": "sleigh bells/sleigh-bells__05_mezzo-forte_shaken.mp3",
  djembe: "djembe/djembe__05_forte_undamped.mp3",
  cowbell: "cowbell/cowbell__025_mezzo-forte_damped.mp3",
  woodblock: "woodblock/woodblock__025_mezzo-forte_struck-singly.mp3",
};
const sustainingPercussionSamples = {
  "suspended cymbal": "suspended cymbal/suspended-cymbal__long_forte_vibe-mallet-undamped.mp3",
  "sleigh bells": "sleigh bells/sleigh-bells__long_mezzo-forte_shaken.mp3",
  "wind chimes": "wind chimes/wind-chimes__long_mezzo-piano_hand.mp3",
  "tam-tam": "tam-tam/tam-tam__long_mezzo-piano_undamped.mp3",
};
const instrumentSamples = {
  ...Object.fromEntries(
    Object.entries(instrumentSampleNames).map(([instrument, names]) => [
      instrument,
      {
        extension: "ogg",
        midis: names
          .split(" ")
          .map(sampleNameToMidi)
          .filter((midi) => midi !== null),
      },
    ]),
  ),
};
const sampleBytes = new Map();
const boardTexture = loadImage("assets/board-and-stones/baduktv-board.png");
const stoneTextures = {
  B: [
    loadImage("assets/board-and-stones/stones/baduktv_bb_0.png"),
    loadImage("assets/board-and-stones/stones/baduktv_bb_1.png"),
    loadImage("assets/board-and-stones/stones/baduktv_bb_2.png"),
  ],
  W: [
    loadImage("assets/board-and-stones/stones/baduktv_ww_0.png"),
    loadImage("assets/board-and-stones/stones/baduktv_ww_1.png"),
    loadImage("assets/board-and-stones/stones/baduktv_ww_2.png"),
  ],
};

function loadImage(src) {
  const image = new Image();
  image.onload = () => redrawCurrentBoard();
  image.src = src;
  return image;
}

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function parseSgf(text) {
  const size = Number(text.match(/SZ\[(\d+)\]/)?.[1] || 19);
  const komi = text.match(/KM\[([^\]]+)\]/)?.[1] || "";
  const black = text.match(/PB\[([^\]]+)\]/)?.[1] || "Black";
  const white = text.match(/PW\[([^\]]+)\]/)?.[1] || "White";
  const blackRank = text.match(/BR\[([^\]]+)\]/)?.[1] || "";
  const whiteRank = text.match(/WR\[([^\]]+)\]/)?.[1] || "";
  const date = text.match(/DT\[([^\]]+)\]/)?.[1] || "";
  const moves = [];
  const movePattern = /;([BW])\[([a-z]{0,2})\]/gi;
  let match;

  while ((match = movePattern.exec(text))) {
    const coord = match[2].toLowerCase();
    moves.push({
      color: match[1],
      pass: coord.length !== 2,
      x: coord.length === 2 ? letters.indexOf(coord[0]) : -1,
      y: coord.length === 2 ? letters.indexOf(coord[1]) : -1,
    });
  }

  return {
    raw: text,
    seed: hashText(text),
    size: Number.isFinite(size) && size > 1 ? size : 19,
    komi,
    black,
    white,
    blackRank,
    whiteRank,
    date,
    moves: moves.filter((move) => move.pass || (move.x >= 0 && move.y >= 0)),
  };
}

function createBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function neighbors(x, y, size) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size);
}

function collectGroup(board, x, y) {
  const color = board[y][x];
  const stack = [[x, y]];
  const seen = new Set();
  const stones = [];
  let liberties = 0;

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const key = `${cx},${cy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    stones.push([cx, cy]);

    for (const [nx, ny] of neighbors(cx, cy, board.length)) {
      if (!board[ny][nx]) liberties += 1;
      if (board[ny][nx] === color) stack.push([nx, ny]);
    }
  }

  return { stones, liberties };
}

function applyMove(board, move) {
  if (move.pass || board[move.y]?.[move.x]) return { captures: 0 };
  board[move.y][move.x] = move.color;
  const opponent = move.color === "B" ? "W" : "B";
  let captures = 0;

  for (const [nx, ny] of neighbors(move.x, move.y, board.length)) {
    if (board[ny][nx] !== opponent) continue;
    const group = collectGroup(board, nx, ny);
    if (group.liberties === 0) {
      captures += group.stones.length;
      group.stones.forEach(([sx, sy]) => {
        board[sy][sx] = null;
      });
    }
  }

  const ownGroup = collectGroup(board, move.x, move.y);
  if (ownGroup.liberties === 0) {
    ownGroup.stones.forEach(([sx, sy]) => {
      board[sy][sx] = null;
    });
  }

  return { captures };
}

function pickTexture(color, x, y, seed) {
  const textures = stoneTextures[color];
  const index = Math.abs(Math.imul(seed ^ (x + 37), y + 91)) % textures.length;
  return textures[index];
}

function formatPlayer(name, rank) {
  return rank ? `${name} ${rank}` : name;
}

function getBoardTitle(game) {
  if (!game) return { black: "Black", white: "White", date: "" };
  return {
    black: formatPlayer(game.black, game.blackRank),
    white: formatPlayer(game.white, game.whiteRank),
    date: game.date,
  };
}

function drawBoard(board, activeMove = null, progress = 1, game = null, seed = 0, activeEntry = null) {
  const size = board.length;
  const width = canvas.width;
  const pad = width * 0.085;
  const gap = (width - pad * 2) / (size - 1);
  const title = getBoardTitle(game);

  if (textureInput.value === "photo" && boardTexture.complete) {
    ctx.drawImage(boardTexture, 0, 0, width, width);
  } else {
    const wood = ctx.createLinearGradient(0, 0, width, width);
    wood.addColorStop(0, "#e7b56b");
    wood.addColorStop(0.45, "#c9873f");
    wood.addColorStop(1, "#a7602c");
    ctx.fillStyle = wood;
    ctx.fillRect(0, 0, width, width);

    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 90; i += 1) {
      ctx.strokeStyle = i % 3 ? "#5b2e14" : "#fff2c7";
      ctx.lineWidth = 1;
      const y = ((i * 37) % width) + Math.sin(i) * 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.3, y + 24, width * 0.7, y - 24, width, y + 10);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = "rgba(49, 28, 13, 0.78)";
  ctx.lineWidth = Math.max(1, width * 0.0018);
  for (let i = 0; i < size; i += 1) {
    const p = pad + i * gap;
    ctx.beginPath();
    ctx.moveTo(pad, p);
    ctx.lineTo(width - pad, p);
    ctx.moveTo(p, pad);
    ctx.lineTo(p, width - pad);
    ctx.stroke();
  }

  const hoshi = size === 19 ? [3, 9, 15] : size === 13 ? [3, 6, 9] : [2, size - 3];
  ctx.fillStyle = "rgba(40, 22, 12, 0.7)";
  hoshi.forEach((x) => {
    hoshi.forEach((y) => {
      ctx.beginPath();
      ctx.arc(pad + x * gap, pad + y * gap, gap * 0.105, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  board.forEach((row, y) => {
    row.forEach((stone, x) => {
      if (!stone) return;
      drawStone(pad + x * gap, pad + y * gap, gap * 0.516, stone, pickTexture(stone, x, y, seed));
    });
  });

  if (activeMove && !activeMove.pass) {
    const radius = gap * 0.576 * (0.72 + progress * 0.28);
    drawStone(
      pad + activeMove.x * gap,
      pad + activeMove.y * gap,
      radius,
      activeMove.color,
      pickTexture(activeMove.color, activeMove.x, activeMove.y, seed),
    );
    ctx.strokeStyle = activeMove.color === "B" ? "#f7ecd8" : "#24170f";
    ctx.lineWidth = width * 0.004;
    ctx.beginPath();
    ctx.arc(pad + activeMove.x * gap, pad + activeMove.y * gap, radius * 0.48, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (activeEntry?.displayLabel) {
    const badgeText = `Move ${activeEntry.moveNumber}: ${activeEntry.displayLabel}`;
    ctx.font = `800 ${Math.round(width * 0.026)}px Inter, sans-serif`;
    const badgeWidth = ctx.measureText(badgeText).width + width * 0.052;
    const badgeHeight = width * 0.052;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = pad * 0.24;
    ctx.fillStyle = "rgba(20, 13, 8, 0.82)";
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    ctx.fillStyle = "#fff4db";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  ctx.fillStyle = "rgba(30, 19, 11, 0.78)";
  ctx.font = `${Math.round(width * 0.023)}px Georgia, serif`;
  ctx.fillText(title.black, pad, width - pad * 0.42);
  const whiteWidth = ctx.measureText(title.white).width;
  ctx.fillText(title.white, width - pad - whiteWidth, width - pad * 0.42);
  if (title.date) {
    ctx.font = `${Math.round(width * 0.019)}px Georgia, serif`;
    const dateWidth = ctx.measureText(title.date).width;
    ctx.fillText(title.date, (width - dateWidth) / 2, width - pad * 0.42);
  }
}

function drawStone(x, y, r, color, texture) {
  if (texture?.complete) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.48)";
    ctx.shadowBlur = r * 0.26;
    ctx.shadowOffsetY = r * 0.16;
    ctx.drawImage(texture, x - r, y - r, r * 2, r * 2);
    ctx.shadowColor = "transparent";
    return;
  }

  const gradient = ctx.createRadialGradient(x - r * 0.32, y - r * 0.35, r * 0.08, x, y, r);
  if (color === "B") {
    gradient.addColorStop(0, "#5e554c");
    gradient.addColorStop(0.42, "#171411");
    gradient.addColorStop(1, "#030303");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.55, "#e8e1d5");
    gradient.addColorStop(1, "#a99b88");
  }
  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(31, 18, 8, 0.42)";
  ctx.shadowBlur = r * 0.28;
  ctx.shadowOffsetY = r * 0.18;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
}

function getCurrentSettings() {
  const instrument = instrumentInput?.value || blackInstrumentInput?.value || "piano";
  return {
    instrument,
    instruments: [instrument],
    scale: scaleInput.value,
    chord: chordInput.value,
    musicMode: neighborhoodInput?.checked ? "hirajoshi-neighborhood" : musicModeInput.value,
    register: registerInput.value,
    mood: "neutral",
    legato: Boolean(legatoInput?.checked),
    drone: Boolean(droneInput?.checked),
  };
}

function getFlowSettings() {
  return {
    connection: connectionInput?.value || (legatoInput?.checked ? "legato" : "natural"),
    texture: textureStyleInput?.value || "blend",
    structure: structureInput?.value || "through-composed",
  };
}

function getComposition(game, settings = getCurrentSettings()) {
  const selectedScale = scaleModes[settings.scale] || scaleModes.major;
  const modeScales = {
    balanced: selectedScale,
    wide: selectedScale,
    pentatonic: [0, 2, 4, 7, 9],
    "goto-music-move37": [7, 9, 10, 2, 3],
    "hirajoshi-neighborhood": [0, 1, 5, 7, 8],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  };
  const root = settings.musicMode === "hirajoshi-neighborhood" || settings.musicMode === "goto-music-move37" ? 55 : 36 + (game.seed % 12);
  const scale = modeScales[settings.musicMode] || modeScales.balanced;
  return { root, scale };
}

function midiToSampleName(midi) {
  const clamped = Math.max(21, Math.min(109, Math.round(midi)));
  const octave = Math.floor(clamped / 12) - 1;
  return `${noteNames[clamped % 12]}${octave}`;
}

function midiToDisplayName(midi) {
  const clamped = Math.max(0, Math.round(midi));
  const octave = Math.floor(clamped / 12) - 1;
  return `${displayNoteNames[clamped % 12]}${octave}`;
}

function describeMoveNotes(notes, fallbackMidi = null) {
  const labels = [...new Set(notes.map((midi) => midiToDisplayName(midi)))];
  if (labels.length) return labels.join(" / ");
  return fallbackMidi === null ? "" : midiToDisplayName(fallbackMidi);
}

function getInstrument(settings = getCurrentSettings()) {
  const instrumentName = settings.instrument || settings.instruments?.find((name) => melodicInstrumentNames.includes(name)) || "piano";
  return instrumentSamples[instrumentName] || instrumentSamples.piano;
}

function getSimpleInstrumentLabel() {
  if (regionRows.length) return "complex";
  if (blackInstrumentInput || whiteInstrumentInput) {
    const black = blackInstrumentInput?.selectedOptions?.[0]?.textContent || "Piano";
    const white = whiteInstrumentInput?.selectedOptions?.[0]?.textContent || "Guitar";
    return `${black.toLowerCase()} / ${white.toLowerCase()}`;
  }
  return instrumentInput?.selectedOptions?.[0]?.textContent?.toLowerCase() || "piano";
}

function buildNotePool(game, settings = getCurrentSettings()) {
  const mode = settings.musicMode;
  const { root, scale } = getComposition(game, settings);
  const instrument = getInstrument(settings);
  const ranges = {
    full: { base: 21, max: 109 },
    middle: { base: 43, max: 72 },
    high: { base: 55, max: 92 },
    low: { base: 28, max: 61 },
  };
  const range = ranges[settings.register] || ranges.full;

  const pool = instrument.midis.filter((midi) => {
    if (midi < range.base || midi > range.max) return false;
    if (mode === "all" || mode === "chromatic") return true;
    return scale.includes((((midi - root) % 12) + 12) % 12);
  });
  return pool.length ? pool : instrument.midis;
}

function noteForMove(game, move, index, captures, settings = getCurrentSettings()) {
  if (settings.musicMode === "goto-music-move37") return noteForGotoMusicMove(game, move, settings).midi;
  if (settings.musicMode === "hirajoshi-neighborhood") return noteForNeighborhoodMove(game, move, settings);

  const pool = buildNotePool(game, settings);
  const coordinate = move.pass ? index * 7 : move.x * 11 + move.y * 17;
  const phrase = Math.floor(index / 8) * 5 + index * 13;
  const seeded = coordinate + phrase + (game.seed % 97) + captures * 19 + (move.color === "W" ? 23 : 0);
  const primary = pool[Math.abs(seeded) % pool.length];
  const previous = index > 0 ? pool[Math.abs(seeded - 13) % pool.length] : primary;
  const leap = primary - previous;

  if (settings.musicMode !== "all" && Math.abs(leap) > 14) {
    const direction = leap > 0 ? -12 : 12;
    const softened = primary + direction;
    if (pool.includes(softened)) return softened;
  }

  return primary;
}

function getGotoMusicNeighborhood(game, move, board) {
  if (!board || move.pass) return { index: 1, occupiedNeighbors: 0, density: 0 };
  let score = 0;
  let occupiedNeighbors = 0;
  let occupiedTotal = 0;

  board.forEach((row) => {
    row.forEach((stone) => {
      if (stone) occupiedTotal += 1;
    });
  });

  for (let y = move.y - 1; y <= move.y + 1; y += 1) {
    for (let x = move.x - 1; x <= move.x + 1; x += 1) {
      if (x < 0 || y < 0 || x >= game.size || y >= game.size) continue;
      const stone = board[y][x];
      if (!stone) continue;
      score += stone === "B" ? 1 : 2;
      occupiedNeighbors += 1;
    }
  }

  return {
    index: Math.max(1, Math.min(gotoMusicScale.length, score)),
    occupiedNeighbors,
    density: occupiedTotal / (game.size * game.size),
  };
}

function getGotoMusicIndex(game, move, board) {
  return getGotoMusicNeighborhood(game, move, board).index;
}

function noteForGotoMusicMove(game, move, settings = getCurrentSettings()) {
  const neighborhood = getGotoMusicNeighborhood(game, move, settings.board);
  const crescendoSteps = Math.floor(neighborhood.density * 5) + Math.floor(Math.max(0, neighborhood.occupiedNeighbors - 2) / 4);
  const index = Math.min(gotoMusicScale.length, neighborhood.index + crescendoSteps);
  if (settings.scale === "korean-pentatonic") return gotoMusicScale[index - 1];

  const scale = scaleModes[settings.scale] || scaleModes.major;
  const base = noteLabelToMidi.G + 12 * 4;
  const degree = index - 1;
  const octaveOffset = Math.floor(degree / scale.length) * 12;
  const midi = base + scale[degree % scale.length] + octaveOffset;
  return { index, label: midiToDisplayName(midi), midi };
}

function noteForNeighborhoodMove(game, move, settings = getCurrentSettings()) {
  const board = settings.board;
  const notePool = buildNotePool(game, { ...settings, musicMode: "hirajoshi-neighborhood" });
  if (!board || move.pass) return nearestAvailableMidi(38, notePool);

  let neighborhoodScore = 0;
  let occupiedNeighbors = 0;
  let occupiedTotal = 0;

  board.forEach((row) => {
    row.forEach((stone) => {
      if (stone) occupiedTotal += 1;
    });
  });

  for (let y = move.y - 1; y <= move.y + 1; y += 1) {
    for (let x = move.x - 1; x <= move.x + 1; x += 1) {
      if (x < 0 || y < 0 || x >= game.size || y >= game.size) continue;
      const stone = board[y][x];
      if (!stone) continue;
      neighborhoodScore += stone === "B" ? 1 : 2;
      occupiedNeighbors += 1;
    }
  }

  const density = occupiedTotal / (game.size * game.size);
  const pitchClass = hirajoshiPitchClasses[neighborhoodScore % hirajoshiPitchClasses.length];
  const octave = 2 + Math.floor(density * 3.4) + Math.floor(Math.max(0, occupiedNeighbors - 1) / 3);
  const target = 12 * (Math.min(6, octave) + 1) + pitchClass;
  return nearestAvailableMidi(target, notePool);
}

function nearestAvailableMidi(target, pool) {
  return pool.reduce((nearest, midi) => (Math.abs(midi - target) < Math.abs(nearest - target) ? midi : nearest), pool[0]);
}

function playableMidiForInstrument(midi, instrumentName) {
  const instrument = instrumentSamples[instrumentName] || instrumentSamples.piano;
  return nearestAvailableMidi(midi, instrument.midis);
}

function chordForMidi(game, midi, settings = getCurrentSettings()) {
  const chord = chordModes[settings.chord] || chordModes.none;
  if (!chord.length) return [midi];
  const pool = buildNotePool(game, settings);
  const { root, scale } = getComposition(game, settings);
  const scaleIndex = scale.findIndex((step) => step === (((midi - root) % 12) + 12) % 12);
  const start = scaleIndex >= 0 ? scaleIndex : 0;
  const chordMidis = chord.map((degree) => {
    const absoluteDegree = start + degree;
    const octaveOffset = Math.floor(absoluteDegree / scale.length) * 12;
    const interval = scale[absoluteDegree % scale.length] + octaveOffset;
    return midi + interval - scale[start];
  });
  return [...new Set(chordMidis.map((note) => nearestAvailableMidi(note, pool)))];
}

function getMoodProfile(name) {
  return moodProfiles[name] || moodProfiles.neutral;
}

function createMoodOptions(selected = "neutral") {
  return Object.entries(moodProfiles)
    .map(([value, mood]) => `<option value="${value}"${value === selected ? " selected" : ""}>${mood.label}</option>`)
    .join("");
}

function createOptions(options, selected) {
  return options
    .map(({ value, label }) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`)
    .join("");
}

function createInstrumentChecks(selected = ["piano"], className = "region-instrument-option", { includePercussion = true } = {}) {
  const instruments = [
    ...melodicInstrumentNames.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
    ...(includePercussion ? Object.keys(percussionSamples).map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })) : []),
  ];
  return instruments
    .map(
      ({ value, label }) => `
        <label class="field field-inline instrument-check">
          <input class="${className}" type="checkbox" value="${value}"${selected.includes(value) ? " checked" : ""} />
          <span>${label}</span>
        </label>
      `,
    )
    .join("");
}

function getCheckedValues(container, selector) {
  const values = [...container.querySelectorAll(selector)]
    .filter((input) => input.checked)
    .map((input) => input.value);
  return values.length ? values : ["piano"];
}

function getOptionalCheckedValues(container, selector) {
  return [...container.querySelectorAll(selector)]
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function initializeRegionRows() {
  const scales = [
    { value: "korean-pentatonic", label: "Korean pentatonic" },
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
  ];
  const chords = [
    { value: "none", label: "None" },
    { value: "triad", label: "Triad" },
    { value: "seventh", label: "Seventh" },
    { value: "sus2", label: "Suspended 2" },
    { value: "sus4", label: "Suspended 4" },
  ];
  const musicModes = [
    { value: "balanced", label: "Scale melody" },
    { value: "goto-music-move37", label: "Go to Music crescendo" },
    { value: "wide", label: "Wider melody" },
    { value: "pentatonic", label: "Pentatonic melody" },
    { value: "chromatic", label: "Chromatic color" },
    { value: "all", label: "All available notes" },
  ];
  const registers = [
    { value: "full", label: "Full range" },
    { value: "middle", label: "Middle range" },
    { value: "high", label: "Higher range" },
    { value: "low", label: "Lower range" },
  ];

  regionRows.forEach((row) => {
    const label = row.querySelector("span")?.textContent || "Board part";
    row.innerHTML = `
      <label class="field field-inline region-title">
        <input class="region-enabled" type="checkbox" />
        <span>${label}</span>
      </label>
      <div class="region-controls">
        <label class="field">
          <span>Instruments</span>
          <span class="instrument-checks">${createInstrumentChecks(["piano"], "region-instrument-option", { includePercussion: false })}</span>
        </label>
        <label class="field">
          <span>Scale</span>
          <select class="region-scale">${createOptions(scales, "major")}</select>
        </label>
        <label class="field">
          <span>Chord</span>
          <select class="region-chord">${createOptions(chords, "none")}</select>
        </label>
        <label class="field">
          <span>Music map</span>
          <select class="region-music-mode">${createOptions(musicModes, "balanced")}</select>
        </label>
        <label class="field field-inline region-neighborhood-field">
          <input class="region-neighborhood" type="checkbox" />
          <span>Neighborhood notes</span>
        </label>
        <label class="field">
          <span>Register</span>
          <select class="region-register">${createOptions(registers, "full")}</select>
        </label>
        <label class="field">
          <span>Mood</span>
          <select class="region-mood">${createMoodOptions("neutral")}</select>
        </label>
        <label class="field field-inline region-legato-field">
          <input class="region-legato" type="checkbox" />
          <span>Legato here</span>
        </label>
      </div>
    `;
  });
}

function addSustainRow({ start = "", end = "", every = 1, instrument = "cello" } = {}) {
  if (!sustainList) return;
  const row = document.createElement("div");
  row.className = "sustain-row";
  const instruments = [
    ...melodicInstrumentNames.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
    ...Object.keys(sustainingPercussionSamples).map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
  ];
  row.innerHTML = `
    <label class="field">
      <span>Instrument</span>
      <select class="sustain-instrument">${createOptions(instruments, instrument)}</select>
    </label>
    <label class="field">
      <span>From</span>
      <input class="sustain-start" type="number" min="1" step="1" value="${start}" placeholder="Start" />
    </label>
    <label class="field">
      <span>To</span>
      <input class="sustain-end" type="number" min="1" step="1" value="${end}" placeholder="End" />
    </label>
    <label class="field">
      <span>Every</span>
      <input class="sustain-every" type="number" min="1" step="1" value="${every}" />
    </label>
    <button class="icon-button remove-sustain" type="button" aria-label="Remove sustain">x</button>
  `;
  row.querySelector(".remove-sustain").addEventListener("click", () => row.remove());
  sustainList.append(row);
}

function addRangeRow({ start = 1, end = "", pace = paceInput.value, mood = "neutral", legato = false } = {}) {
  const row = document.createElement("div");
  row.className = "range-row";
  row.innerHTML = `
    <label class="field">
      <span>From</span>
      <input class="range-start" type="number" min="1" step="1" value="${start}" />
    </label>
    <label class="field">
      <span>To</span>
      <input class="range-end" type="number" min="1" step="1" value="${end}" />
    </label>
    <label class="field">
      <span>Move pace</span>
      <input class="range-pace" type="number" min="0.25" max="2.4" step="0.05" value="${pace}" />
    </label>
    <label class="field">
      <span>Mood</span>
      <select class="range-mood">${createMoodOptions(mood)}</select>
    </label>
    <label class="field">
      <span>Instruments</span>
      <span class="instrument-checks">${createInstrumentChecks([], "range-instrument-option")}</span>
    </label>
    <label class="field field-inline range-legato-field">
      <input class="range-legato" type="checkbox"${legato ? " checked" : ""} />
      <span>Legato here</span>
    </label>
    <button class="icon-button remove-range" type="button" aria-label="Remove range">x</button>
  `;
  row.querySelector(".remove-range").addEventListener("click", () => row.remove());
  rangeList.append(row);
}

function getRangeSettings(moveNumber) {
  const basePace = Number(paceInput.value);
  if (!sectionPacingInput?.checked) {
    return {
      pace: basePace,
      mood: "neutral",
      profile: moodProfiles.neutral,
      legato: Boolean(legatoInput?.checked),
      drone: Boolean(droneInput?.checked),
      instruments: [],
    };
  }

  const rows = [...(rangeList?.querySelectorAll(".range-row") || [])];
  for (const row of rows) {
    const start = Number(row.querySelector(".range-start").value) || 1;
    const endValue = row.querySelector(".range-end").value;
    const end = endValue ? Number(endValue) : Infinity;
    if (moveNumber < start || moveNumber > end) continue;
    const mood = row.querySelector(".range-mood").value;
    const profile = getMoodProfile(mood);
    const customPace = Number(row.querySelector(".range-pace").value);
    return {
      pace: Number.isFinite(customPace) && customPace > 0 ? customPace : basePace * profile.pace,
      mood,
      profile,
      legato: Boolean(legatoInput?.checked) || row.querySelector(".range-legato").checked,
      drone: Boolean(droneInput?.checked),
      instruments: getOptionalCheckedValues(row, ".range-instrument-option"),
    };
  }

  return {
    pace: basePace,
    mood: "neutral",
    profile: moodProfiles.neutral,
    legato: Boolean(legatoInput?.checked),
    drone: Boolean(droneInput?.checked),
    instruments: [],
  };
}

function getRegionName(move, size) {
  if (move.pass) return "center";
  const cornerSize = Math.min(4, size);
  const leftCorner = move.x < cornerSize;
  const rightCorner = move.x >= size - cornerSize;
  const topCorner = move.y < cornerSize;
  const bottomCorner = move.y >= size - cornerSize;
  if (topCorner && leftCorner) return "top-left";
  if (topCorner && rightCorner) return "top-right";
  if (bottomCorner && leftCorner) return "bottom-left";
  if (bottomCorner && rightCorner) return "bottom-right";

  const sideDepth = Math.min(4, size);
  const left = move.x < sideDepth;
  const right = move.x >= size - sideDepth;
  const top = move.y < sideDepth;
  const bottom = move.y >= size - sideDepth;
  if (top && left) return "top-left";
  if (top && right) return "top-right";
  if (bottom && left) return "bottom-left";
  if (bottom && right) return "bottom-right";
  if (top) return "top";
  if (right) return "right";
  if (bottom) return "bottom";
  if (left) return "left";
  return "center";
}

function getRegionSettings(move, game) {
  if (!regionRows.length && (blackInstrumentInput || whiteInstrumentInput)) {
    const instrument = move.color === "B" ? blackInstrumentInput?.value || "piano" : whiteInstrumentInput?.value || "guitar";
    return {
      instrument,
      instruments: [instrument],
      scale: scaleInput.value,
      chord: chordInput.value,
      musicMode: musicModeInput.value,
      register: registerInput.value,
      mood: "neutral",
      legato: Boolean(legatoInput?.checked),
      drone: false,
    };
  }

  const region = getRegionName(move, game.size);
  const row = regionRows.find((item) => item.dataset.region === region);
  if (!row || !row.querySelector(".region-enabled").checked) return getCurrentSettings();
  const instruments = getCheckedValues(row, ".region-instrument-option");
  return {
    instruments,
    instrument: instruments.find((name) => melodicInstrumentNames.includes(name)) || "piano",
    scale: row.querySelector(".region-scale").value,
    chord: row.querySelector(".region-chord").value,
    musicMode: row.querySelector(".region-neighborhood").checked ? "hirajoshi-neighborhood" : row.querySelector(".region-music-mode").value,
    register: row.querySelector(".region-register").value,
    mood: row.querySelector(".region-mood").value,
    legato: row.querySelector(".region-legato").checked,
    drone: Boolean(droneInput?.checked),
  };
}

function getLowAnchorSampleName(game, settings = getCurrentSettings()) {
  const pool = buildNotePool(game, settings);
  const { root } = getComposition(game, settings);
  const target = root + 12;
  return midiToSampleName(nearestAvailableMidi(target, pool));
}

function getSustainSampleName(game, instrumentName) {
  if (sustainingPercussionSamples[instrumentName]) return sustainingPercussionSamples[instrumentName];
  const settings = { ...getCurrentSettings(), instrument: instrumentName, instruments: [instrumentName], register: "low" };
  return getLowAnchorSampleName(game, settings);
}

function getActiveSustainRows(moveNumber) {
  if (!sustainList) return [];
  return [...sustainList.querySelectorAll(".sustain-row")].filter((row) => {
    const start = Number(row.querySelector(".sustain-start").value) || 1;
    const endValue = row.querySelector(".sustain-end").value;
    const end = endValue ? Number(endValue) : Infinity;
    return moveNumber >= start && moveNumber <= end;
  });
}

function shouldPlaySustain(row, moveNumber) {
  const start = Number(row.querySelector(".sustain-start").value) || 1;
  const every = Math.max(1, Number(row.querySelector(".sustain-every").value) || 1);
  return (moveNumber - start) % every === 0;
}

async function getSampleBuffer(audio, instrumentName, sampleName) {
  const path = percussionSamples[instrumentName] || sustainingPercussionSamples[instrumentName]
    ? `assets/music-notes/percussion/${sampleName}`
    : `assets/music-notes/${instrumentName}/${sampleName}.${(instrumentSamples[instrumentName] || instrumentSamples.piano).extension}`;
  if (!sampleBytes.has(path)) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    sampleBytes.set(path, await response.arrayBuffer());
  }
  return audio.decodeAudioData(sampleBytes.get(path).slice(0));
}

async function preloadSamples(audio, timeline, game) {
  const sampleRefs = [
    ...timeline.flatMap((entry) => entry.notes),
    ...timeline
      .filter((entry) => entry.settings.drone)
      .map((entry) => ({ instrument: entry.settings.instrument, sampleName: getLowAnchorSampleName(game, entry.settings) })),
    ...[...(sustainList?.querySelectorAll(".sustain-row") || [])].map((row) => {
      const instrument = row.querySelector(".sustain-instrument").value;
      return { instrument, sampleName: getSustainSampleName(game, instrument) };
    }),
  ];
  const uniqueRefs = [...new Map(sampleRefs.map((ref) => [`${ref.instrument}/${ref.sampleName}`, ref])).values()];
  const decoded = new Map();
  await Promise.all(
    uniqueRefs.map(async ({ instrument, sampleName }) => {
      decoded.set(`${instrument}/${sampleName}`, await getSampleBuffer(audio, instrument, sampleName));
    }),
  );
  return decoded;
}

async function ensureDecodedSample(decoded, audio, instrument, sampleName) {
  const key = `${instrument}/${sampleName}`;
  if (!decoded.has(key)) decoded.set(key, await getSampleBuffer(audio, instrument, sampleName));
  return decoded.get(key);
}

function buildMoveEntry(game, board, move, index, captures) {
  const flow = getFlowSettings();
  const settings = getRegionSettings(move, game);
  const rangeSettings = getRangeSettings(index + 1);
  const layerInstruments = rangeSettings.instruments.length ? [...(settings.instruments || [settings.instrument]), ...rangeSettings.instruments] : settings.instruments || [settings.instrument];
  const uniqueInstruments = [...new Set(layerInstruments)];
  const melodicInstruments = uniqueInstruments.filter((name) => melodicInstrumentNames.includes(name));
  const percussionInstruments = uniqueInstruments.filter((name) => percussionSamples[name]);
  const leadInstrument = melodicInstruments[0] || "piano";
  const noteSettings = { ...settings, instrument: leadInstrument, board };
  const midi = noteForMove(game, move, index, captures, noteSettings);
  const gotoMusic = settings.musicMode === "goto-music-move37" ? noteForGotoMusicMove(game, move, noteSettings) : null;
  const chord = chordForMidi(game, midi, noteSettings);
  const textureNotes = flow.texture === "homophony" ? chord.slice(0, Math.max(1, Math.min(2, chord.length))) : chord;
  const displayLabel = gotoMusic ? gotoMusic.label : describeMoveNotes(textureNotes, midi);
  const melodicNotes = melodicInstruments.flatMap((instrument) =>
    textureNotes.map((note) => ({ instrument, sampleName: midiToSampleName(playableMidiForInstrument(note, instrument)), kind: "melodic" })),
  );
  const percussionNotes = percussionInstruments.map((instrument) => ({
    instrument,
    sampleName: percussionSamples[instrument],
    kind: "percussion",
  }));
  return {
    move,
    moveNumber: index + 1,
    captures,
    midi,
    gotoMusic,
    displayLabel,
    settings: noteSettings,
    rangeSettings,
    flow,
    notes: [...melodicNotes, ...percussionNotes],
  };
}

function makeImpulseResponse(audio, duration = 1.4, decay = 2.4) {
  const length = Math.floor(audio.sampleRate * duration);
  const impulse = audio.createBuffer(2, length, audio.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const fade = (1 - index / length) ** decay;
      data[index] = (Math.random() * 2 - 1) * fade * 0.42;
    }
  }

  return impulse;
}

function createAudioOutput(audio, destination) {
  const master = audio.createGain();
  const dry = audio.createGain();
  const reverbSend = audio.createGain();
  const delaySend = audio.createGain();
  const convolver = audio.createConvolver();
  const delay = audio.createDelay(1);
  const delayFeedback = audio.createGain();
  const compressor = audio.createDynamicsCompressor();

  master.gain.value = 0.92;
  dry.gain.value = 0.88;
  reverbSend.gain.value = 0.2;
  delaySend.gain.value = 0.08;
  delay.delayTime.value = 0.16;
  delayFeedback.gain.value = 0.22;
  convolver.buffer = makeImpulseResponse(audio);

  compressor.threshold.value = -18;
  compressor.knee.value = 24;
  compressor.ratio.value = 2.2;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.24;

  dry.connect(master);
  reverbSend.connect(convolver);
  convolver.connect(master);
  delaySend.connect(delay);
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(master);
  master.connect(compressor);
  compressor.connect(destination);

  return { dry, reverbSend, delaySend };
}

function playNote(audio, output, buffer, when, duration, color, captures, overlap = 0, chordSize = 1, profile = moodProfiles.neutral, articulation = {}) {
  const gain = audio.createGain();
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const smoothness = articulation.legato ? 1.28 : 1;
  const attack = Math.min(0.34, duration * 0.26 * profile.attack * smoothness);
  const release = Math.min(1.35, (duration * 0.76 + overlap * 0.78) * profile.release * smoothness);
  const noteEnd = when + duration + overlap;
  const sustainUntil = Math.max(when + attack + 0.04, noteEnd - release);

  source.buffer = buffer;
  source.playbackRate.setValueAtTime(1, when);
  filter.type = "lowpass";
  const tone = (color === "B" ? 2350 : 3300) * profile.brightness;
  filter.frequency.setValueAtTime(tone * 0.72, when);
  filter.frequency.linearRampToValueAtTime(tone, when + attack);
  filter.frequency.linearRampToValueAtTime(tone * 0.82, noteEnd);

  gain.gain.setValueAtTime(0.0001, when);
  const volume = Number(volumeInput.value);
  const chordTrim = 1 / Math.sqrt(chordSize);
  const peak = (0.34 + Math.min(captures, 3) * 0.038) * volume * chordTrim * profile.volume;
  const sustain = peak * 0.58;
  gain.gain.exponentialRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(sustain, sustainUntil);
  gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output.dry);
  gain.connect(output.reverbSend);
  gain.connect(output.delaySend);
  source.start(when);
  source.stop(noteEnd + 0.06);
}

function startDrone(audio, output, buffer, profile) {
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  const volume = Number(volumeInput.value);
  const now = audio.currentTime;

  source.buffer = buffer;
  source.loop = true;
  filter.type = "lowpass";
  filter.frequency.value = 950 * profile.brightness;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.075 * volume * profile.volume, now + 0.8);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output.dry);
  gain.connect(output.reverbSend);
  source.start(now);

  return { source, gain };
}

function stopDrone(audio, drone, fade = 0.7) {
  if (!drone) return;
  const now = audio.currentTime;
  drone.gain.gain.cancelScheduledValues(now);
  drone.gain.gain.setValueAtTime(Math.max(0.0001, drone.gain.gain.value), now);
  drone.gain.gain.exponentialRampToValueAtTime(0.0001, now + fade);
  drone.source.stop(now + fade + 0.05);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playGame(game, { record = false } = {}) {
  playbackAbort.cancelled = true;
  playbackAbort = { cancelled: false };
  const abort = playbackAbort;
  const audio = new AudioContext();
  activeAudio = audio;
  const audioDestination = record ? audio.createMediaStreamDestination() : audio.destination;
  const audioOutput = createAudioOutput(audio, audioDestination);
  const board = createBoard(game.size);
  const instrumentName = getSimpleInstrumentLabel();
  statusEl.textContent = record ? `Rendering with ${instrumentName} audio...` : `Playing with ${instrumentName} audio...`;
  const samples = new Map();
  const frameMs = 1000 / 30;
  let activeDrone = null;
  let activeDroneKey = "";
  let recorder = null;
  let chunks = [];

  if (record) {
    const stream = canvas.captureStream(30);
    audioDestination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    recorder = new MediaRecorder(stream, { mimeType: getMimeType() });
    activeRecorder = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.start();
  }

  drawBoard(board, null, 1, game, game.seed);
  await wait(500);
  for (let index = 0; index < game.moves.length; index += 1) {
    if (abort.cancelled) break;
    const move = game.moves[index];
    const result = applyMove(board, move);
    const entry = buildMoveEntry(game, board, move, index, result.captures);
    const rangeSettings = entry.rangeSettings;
    const flow = entry.flow;
    const profile = getMoodProfile(entry.settings.mood !== "neutral" ? entry.settings.mood : rangeSettings.mood);
    const movePace = Math.max(0.22, rangeSettings.pace || Number(paceInput.value));
    const moveMs = movePace * 1000;
    const isLegato = flow.connection === "legato" || rangeSettings.legato || entry.settings.legato;
    const connectionShape = {
      legato: { duration: 1.08, overlap: 1.1, stagger: 0.018 },
      dovetail: { duration: 1.16, overlap: 1.28, stagger: 0.04 },
      "voice-leading": { duration: 1, overlap: 0.95, stagger: 0.014 },
      glissando: { duration: 1.22, overlap: 1.42, stagger: 0.065 },
      natural: { duration: 1, overlap: 0.78, stagger: 0.024 },
    }[flow.connection] || { duration: 1, overlap: 1, stagger: 0.018 };
    if (rangeSettings.legato || entry.settings.legato) {
      connectionShape.duration *= 1.18;
      connectionShape.overlap *= 1.36;
      connectionShape.stagger *= 0.55;
    }
    const structureShape = {
      "through-composed": { duration: 1, overlap: 1 },
      transition: { duration: 1.06, overlap: 1.16 },
      "organic-unity": { duration: 1.12, overlap: 1.24 },
    }[flow.structure] || { duration: 1, overlap: 1 };
    const noteDuration = movePace * Number(noteLengthInput.value) * profile.duration * connectionShape.duration * structureShape.duration;
    const noteOverlap = Math.min(movePace * 0.68 * profile.overlap * connectionShape.overlap * structureShape.overlap, isLegato ? 1.65 : 1.15);
    for (const row of getActiveSustainRows(index + 1)) {
      if (!shouldPlaySustain(row, index + 1)) continue;
      const instrument = row.querySelector(".sustain-instrument").value;
      const sampleName = getSustainSampleName(game, instrument);
      const sample = await ensureDecodedSample(samples, audio, instrument, sampleName);
      if (abort.cancelled) break;
      playNote(
        audio,
        audioOutput,
        sample,
        audio.currentTime + 0.006,
        movePace * 1.6,
        move.color,
        result.captures,
        Math.min(movePace, 1.2),
        1,
        profile,
        { legato: isLegato },
      );
    }
    const droneSampleName = getLowAnchorSampleName(game, entry.settings);
    const droneSampleKey = `${entry.settings.instrument}/${droneSampleName}`;
    const droneKey = rangeSettings.drone || entry.settings.drone ? `${droneSampleKey}-${profile.label}` : "";
    if (droneKey !== activeDroneKey) {
      stopDrone(audio, activeDrone);
      activeDrone = droneKey ? startDrone(audio, audioOutput, await ensureDecodedSample(samples, audio, entry.settings.instrument, droneSampleName), profile) : null;
      activeDroneKey = droneKey;
    }
    for (const [chordIndex, note] of entry.notes.entries()) {
      const sample = await ensureDecodedSample(samples, audio, note.instrument, note.sampleName);
      if (abort.cancelled) break;
      const scheduledTime = audio.currentTime + 0.014 + chordIndex * connectionShape.stagger;
      playNote(
        audio,
        audioOutput,
        sample,
        scheduledTime,
        noteDuration,
        move.color,
        result.captures,
        noteOverlap,
        entry.notes.length,
        profile,
        { legato: isLegato },
      );
    }
    const started = performance.now();

    while (performance.now() - started < moveMs) {
      if (abort.cancelled) break;
      const progress = Math.min(1, (performance.now() - started) / moveMs);
      drawBoard(board, move, progress, game, game.seed, entry);
      await wait(frameMs);
    }

    statusEl.textContent = `Move ${index + 1} of ${game.moves.length}${profile.label !== "Neutral" ? ` - ${profile.label}` : ""}`;
  }

  drawBoard(board, null, 1, game, game.seed);
  const hadDrone = Boolean(activeDrone);
  stopDrone(audio, activeDrone);
  await wait(record || hadDrone || getFlowSettings().connection === "legato" ? 900 : 150);
  if (audio.state !== "closed") await audio.close();
  if (activeAudio === audio) activeAudio = null;

  if (record && recorder) {
    if (recorder.state !== "inactive") {
      const done = new Promise((resolve) => {
        recorder.onstop = resolve;
      });
      recorder.stop();
      await done;
    }
    if (activeRecorder === recorder) activeRecorder = null;
    return abort.cancelled ? null : new Blob(chunks, { type: recorder.mimeType });
  }

  return { stopped: abort.cancelled };
}

function getMimeType() {
  const preferred = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return preferred.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  loadedGame = parseSgf(text);
  canvas.width = Number(sizeInput.value);
  canvas.height = Number(sizeInput.value);
  drawBoard(createBoard(loadedGame.size), null, 1, loadedGame, loadedGame.seed);
  metaEl.innerHTML = `<span>${formatPlayer(loadedGame.black, loadedGame.blackRank)} vs ${formatPlayer(loadedGame.white, loadedGame.whiteRank)}<br>${loadedGame.size}x${loadedGame.size}, ${loadedGame.moves.length} moves${loadedGame.komi ? `, komi ${loadedGame.komi}` : ""}${loadedGame.date ? `<br>${loadedGame.date}` : ""}</span>`;
  statusEl.textContent = "Ready to play or render.";
  playButton.disabled = false;
  renderButton.disabled = false;
  stopButton.disabled = true;
  downloadLink.hidden = true;
});

playButton.addEventListener("click", async () => {
  if (!loadedGame) return;
  playButton.disabled = true;
  renderButton.disabled = true;
  stopButton.disabled = false;
  statusEl.textContent = "Playing locally...";
  try {
    const result = await playGame(loadedGame);
    statusEl.textContent = result?.stopped ? "Playback stopped." : "Playback complete.";
  } catch (error) {
    statusEl.textContent = error.message;
  }
  playButton.disabled = false;
  renderButton.disabled = false;
  stopButton.disabled = true;
});

stopButton.addEventListener("click", async () => {
  playbackAbort.cancelled = true;
  stopButton.disabled = true;
  statusEl.textContent = "Stopping...";
  if (activeAudio && activeAudio.state !== "closed") await activeAudio.close();
});

renderButton.addEventListener("click", async () => {
  if (!loadedGame) return;
  canvas.width = Number(sizeInput.value);
  canvas.height = Number(sizeInput.value);
  playButton.disabled = true;
  renderButton.disabled = true;
  stopButton.disabled = false;
  downloadLink.hidden = true;
  statusEl.textContent = `Rendering video with ${getSimpleInstrumentLabel()} audio...`;
  try {
    const blob = await playGame(loadedGame, { record: true });
    if (!blob) {
      statusEl.textContent = "Render stopped.";
    } else {
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "sgf-to-music.webm";
      downloadLink.hidden = false;
      statusEl.textContent = "Video rendered locally.";
    }
  } catch (error) {
    statusEl.textContent = error.message;
  }
  playButton.disabled = false;
  renderButton.disabled = false;
  stopButton.disabled = true;
});

function redrawCurrentBoard() {
  canvas.width = Number(sizeInput.value);
  canvas.height = Number(sizeInput.value);
  if (loadedGame) {
    drawBoard(createBoard(loadedGame.size), null, 1, loadedGame, loadedGame.seed);
  } else {
    drawBoard(createBoard(19), null, 1);
  }
}

sizeInput.addEventListener("change", redrawCurrentBoard);
textureInput.addEventListener("change", redrawCurrentBoard);
initializeRegionRows();
sectionPacingInput?.addEventListener("change", () => {
  rangeEditor.hidden = !sectionPacingInput.checked;
  if (sectionPacingInput.checked && !rangeList.children.length) {
    addRangeRow({ start: 1, end: loadedGame?.moves.length || "", mood: "neutral" });
  }
});
addRangeButton?.addEventListener("click", () => {
  const lastRow = rangeList.lastElementChild;
  const nextStart = lastRow ? Number(lastRow.querySelector(".range-end").value) + 1 || "" : 1;
  addRangeRow({ start: nextStart, mood: "neutral" });
});
addSustainButton?.addEventListener("click", () => {
  addSustainRow();
});

settingsGroups.forEach((group) => {
  group.addEventListener("toggle", () => {
    if (!group.open) return;
    settingsGroups.forEach((otherGroup) => {
      if (otherGroup !== group) otherGroup.open = false;
    });
  });
});

drawBoard(createBoard(19), null, 1);
