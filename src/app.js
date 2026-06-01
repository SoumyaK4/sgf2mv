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
const simpleInstrumentBlendInput = document.querySelector("#simpleInstrumentBlendInput");
const simplePercussionInput = document.querySelector("#simplePercussionInput");
const simpleFightingDramaInput = document.querySelector("#simpleFightingDramaInput");
const simpleMusicTypeInput = document.querySelector("#simpleMusicTypeInput");
const musicModeInput = document.querySelector("#musicModeInput");
const neighborhoodInput = document.querySelector("#neighborhoodInput");
const tacticalAccentsInput = document.querySelector("#tacticalAccentsInput");
const tacticalAccentModeInput = document.querySelector("#tacticalAccentModeInput");
const tacticalIntensityInput = document.querySelector("#tacticalIntensityInput");
const fightIntervalInput = document.querySelector("#fightIntervalInput");
const atariIntervalInput = document.querySelector("#atariIntervalInput");
const captureIntervalInput = document.querySelector("#captureIntervalInput");
const koIntervalInput = document.querySelector("#koIntervalInput");
const fightPaceInput = document.querySelector("#fightPaceInput");
const capturePaceInput = document.querySelector("#capturePaceInput");
const tacticalPaceCarryInput = document.querySelector("#tacticalPaceCarryInput");
const phraseShapingInput = document.querySelector("#phraseShapingInput");
const positionColorInput = document.querySelector("#positionColorInput");
const barLengthInput = document.querySelector("#barLengthInput");
const phraseBarsInput = document.querySelector("#phraseBarsInput");
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
  "chinese-pentatonic": [0, 2, 4, 7, 9],
  "japanese-hirajoshi": [0, 1, 5, 7, 8],
  "japanese-insen": [0, 1, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
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
const decodedSampleBuffers = new WeakMap();
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

function boardHash(board) {
  return board.map((row) => row.map((stone) => stone || ".").join("")).join("/");
}

function applyMove(board, move) {
  if (move.pass || board[move.y]?.[move.x]) return { captures: 0, capturedStones: [], ownLiberties: 0, koLike: false };
  board[move.y][move.x] = move.color;
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
      });
    }
  }

  const ownGroup = collectGroup(board, move.x, move.y);
  const ownLiberties = ownGroup.liberties;
  if (ownGroup.liberties === 0) {
    ownGroup.stones.forEach(([sx, sy]) => {
      board[sy][sx] = null;
    });
  }

  return { captures, capturedStones, ownLiberties, koLike: captures === 1 && ownLiberties === 1 };
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
    ctx.font = `800 ${Math.round(width * 0.025)}px Inter, sans-serif`;
    ctx.fillStyle = "rgba(42, 25, 12, 0.88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, width / 2, pad * 0.52);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  ctx.fillStyle = "rgba(30, 19, 11, 0.9)";
  ctx.font = `700 ${Math.round(width * 0.023)}px Georgia, serif`;
  ctx.fillText(title.black, pad, width - pad * 0.42);
  const whiteWidth = ctx.measureText(title.white).width;
  ctx.fillText(title.white, width - pad - whiteWidth, width - pad * 0.42);
  if (title.date) {
    ctx.font = `700 ${Math.round(width * 0.019)}px Georgia, serif`;
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

function getMusicalIntelligenceSettings() {
  const numberValue = (input, fallback) => {
    const value = Number(input?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const barLength = isSimplePage() ? 4 : Math.max(2, Math.min(16, Math.round(numberValue(barLengthInput, 4))));
  const phraseBars = isSimplePage() ? 2 : Math.max(1, Math.min(8, Math.round(numberValue(phraseBarsInput, 2))));
  return {
    phraseShaping: phraseShapingInput ? phraseShapingInput.checked : true,
    positionColor: isSimplePage() ? false : positionColorInput ? positionColorInput.checked : true,
    barLength,
    phraseBars,
  };
}

function getFlowSettings() {
  return {
    connection: connectionInput?.value || (legatoInput?.checked ? "legato" : "natural"),
    texture: textureStyleInput?.value || "blend",
    structure: structureInput?.value || "through-composed",
  };
}

function getTacticalSettings() {
  const numericValue = (input, fallback) => {
    const value = Number(input?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  if (tacticalAccentModeInput) {
    return {
      mode: tacticalAccentModeInput.value,
      intensity: numericValue(tacticalIntensityInput, 1),
      fightInterval: numericValue(fightIntervalInput, 2),
      atariInterval: numericValue(atariIntervalInput, 1),
      captureInterval: numericValue(captureIntervalInput, 3),
      koInterval: numericValue(koIntervalInput, 1),
      fightPace: numericValue(fightPaceInput, 1.22),
      capturePace: numericValue(capturePaceInput, 0.78),
      paceCarry: Math.max(0, numericValue(tacticalPaceCarryInput, 1)),
    };
  }
  return {
    mode: tacticalAccentsInput?.checked ? "subtle" : "off",
    intensity: 0.42,
    fightInterval: 2,
    atariInterval: 1,
    captureInterval: 3,
    koInterval: 1,
    fightPace: 1.14,
    capturePace: 0.86,
    paceCarry: 1,
  };
}

function getComposition(game, settings = getCurrentSettings()) {
  const selectedScale = scaleModes[settings.scale] || scaleModes.major;
  const modeScales = {
    balanced: selectedScale,
    wide: selectedScale,
    pentatonic: [0, 2, 4, 7, 9],
    "goto-music-move37": selectedScale,
    "hirajoshi-neighborhood": [0, 1, 5, 7, 8],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  };
  const root =
    settings.musicMode === "hirajoshi-neighborhood"
      ? 38
      : settings.scale === "chinese-pentatonic"
        ? noteLabelToMidi.D + 12 * 4
        : settings.musicMode === "goto-music-move37"
          ? noteLabelToMidi.G + 12 * 4
          : 36 + (game.seed % 12);
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

function isSimplePage() {
  return !regionRows.length && Boolean(blackInstrumentInput || whiteInstrumentInput);
}

function getSimpleMusicTypeSettings() {
  const type = simpleMusicTypeInput?.value || "korean";
  const variants = {
    western: { type, scale: "major", musicMode: "balanced", register: "middle", maxStep: 3 },
    korean: { type, scale: "korean-pentatonic", musicMode: "goto-music-move37", register: "full", maxStep: 2 },
    chinese: { type, scale: "chinese-pentatonic", musicMode: "goto-music-move37", register: "middle", maxStep: 2 },
    japanese: { type, scale: "japanese-hirajoshi", musicMode: "hirajoshi-neighborhood", register: "middle", maxStep: 2 },
  };
  return variants[type] || variants.korean;
}

function getExpressiveSimpleSettings(settings, tactics, phrase) {
  if (!isSimplePage()) return settings;
  const variant = getSimpleMusicTypeSettings();
  const tense = tactics.koLike || tactics.fight || tactics.opponentAtari || tactics.ownAtari;
  const release = tactics.captures > 0;
  const phase = phrase.phase || "middle";
  const expressive = {
    western: {
      opening: { scale: "major", musicMode: "balanced", register: "middle" },
      middle: { scale: "mixolydian", musicMode: "balanced", register: "middle" },
      endgame: { scale: "dorian", musicMode: "balanced", register: "middle" },
      tense: { scale: "minor", musicMode: "wide", register: "middle" },
      release: { scale: "major", musicMode: "pentatonic", register: "middle" },
    },
    korean: {
      opening: { scale: "korean-pentatonic", musicMode: "goto-music-move37", register: "full" },
      middle: { scale: "korean-pentatonic", musicMode: "goto-music-move37", register: "full" },
      endgame: { scale: "korean-pentatonic", musicMode: "goto-music-move37", register: "middle" },
      tense: { scale: "japanese-hirajoshi", musicMode: "goto-music-move37", register: "middle" },
      release: { scale: "korean-pentatonic", musicMode: "goto-music-move37", register: "full" },
    },
    chinese: {
      opening: { scale: "chinese-pentatonic", musicMode: "goto-music-move37", register: "middle" },
      middle: { scale: "chinese-pentatonic", musicMode: "goto-music-move37", register: "middle" },
      endgame: { scale: "minor", musicMode: "goto-music-move37", register: "middle" },
      tense: { scale: "minor", musicMode: "wide", register: "middle" },
      release: { scale: "chinese-pentatonic", musicMode: "pentatonic", register: "middle" },
    },
    japanese: {
      opening: { scale: "japanese-hirajoshi", musicMode: "hirajoshi-neighborhood", register: "middle" },
      middle: { scale: "japanese-hirajoshi", musicMode: "hirajoshi-neighborhood", register: "middle" },
      endgame: { scale: "japanese-insen", musicMode: "hirajoshi-neighborhood", register: "middle" },
      tense: { scale: "japanese-insen", musicMode: "hirajoshi-neighborhood", register: "middle" },
      release: { scale: "chinese-pentatonic", musicMode: "pentatonic", register: "middle" },
    },
  }[variant.type];
  const mood = release ? expressive.release : tense ? expressive.tense : expressive[phase] || expressive.middle;
  return { ...settings, ...mood };
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

function noteForMove(game, move, index, captures, settings = getCurrentSettings(), context = {}) {
  if (settings.musicMode === "goto-music-move37") return noteForGotoMusicMove(game, move, settings, context).midi;
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

function noteForGotoMusicMove(game, move, settings = getCurrentSettings(), context = {}) {
  const neighborhood = getGotoMusicNeighborhood(game, move, settings.board);
  const positionStep = getMusicalIntelligenceSettings().positionColor ? context.positionStep || 0 : 0;
  const crescendoSteps = Math.floor(neighborhood.density * 5) + Math.floor(Math.max(0, neighborhood.occupiedNeighbors - 2) / 4) + positionStep;
  const index = Math.max(1, Math.min(gotoMusicScale.length, neighborhood.index + crescendoSteps));
  if (settings.scale === "korean-pentatonic") return gotoMusicScale[index - 1];

  const scale = scaleModes[settings.scale] || scaleModes.major;
  const base = noteLabelToMidi.G + 12 * 4;
  const degree = index - 1;
  const octaveOffset = Math.floor(degree / scale.length) * 12;
  const rootOffset = settings.scale === "chinese-pentatonic" ? noteLabelToMidi.D - noteLabelToMidi.G : 0;
  const midi = base + rootOffset + scale[degree % scale.length] + octaveOffset;
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

function scaleStepMidi(game, midi, settings, stepOffset) {
  const pool = buildNotePool(game, settings).slice().sort((a, b) => a - b);
  if (!pool.length) return midi + stepOffset;
  const nearestIndex = pool.reduce(
    (best, note, index) => (Math.abs(note - midi) < Math.abs(pool[best] - midi) ? index : best),
    0,
  );
  const targetIndex = Math.max(0, Math.min(pool.length - 1, nearestIndex + stepOffset));
  return pool[targetIndex];
}

function smoothMelodyMidi(game, midi, previousMidi, settings, maxStep = 3) {
  if (previousMidi === null || previousMidi === undefined) return midi;
  const pool = buildNotePool(game, settings).slice().sort((a, b) => a - b);
  if (!pool.length) return midi;
  const currentIndex = pool.reduce(
    (best, note, index) => (Math.abs(note - midi) < Math.abs(pool[best] - midi) ? index : best),
    0,
  );
  const previousIndex = pool.reduce(
    (best, note, index) => (Math.abs(note - previousMidi) < Math.abs(pool[best] - previousMidi) ? index : best),
    0,
  );
  const delta = currentIndex - previousIndex;
  if (Math.abs(delta) <= maxStep) return midi;
  return pool[previousIndex + Math.sign(delta) * maxStep] || midi;
}

function companionInstrumentFor(instrument, tactics, phrase) {
  if (tactics.captures > 0) return instrument === "harp" ? "piano" : "harp";
  if (tactics.fight || tactics.opponentAtari || tactics.ownAtari) return instrument === "cello" ? "piano" : "cello";
  if (phrase.phase === "opening") return instrument === "harp" ? "piano" : "harp";
  if (phrase.phase === "endgame") return instrument === "piano" ? "harp" : "piano";
  return { piano: "harp", harp: "piano", cello: "harp", guitar: "piano" }[instrument] || "harp";
}

function getSimpleBlendInstruments(leadInstrument, tactics, phrase) {
  if (!isSimplePage() || !simpleInstrumentBlendInput?.checked) return [];
  const strongMoment = tactics.captures > 0 || tactics.koLike || tactics.fight || tactics.opponentAtari || tactics.ownAtari;
  if (!strongMoment && !phrase.cadence) return [];
  const companion = companionInstrumentFor(leadInstrument, tactics, phrase);
  return companion && companion !== leadInstrument ? [companion] : [];
}

function getSimpleBlendTone(game, midi, noteSettings, instrument, tactics, phrase) {
  let step = 0;
  if (tactics.captures > 0) step = 3;
  else if (tactics.koLike || tactics.opponentAtari || tactics.ownAtari || tactics.fight) step = instrument === "cello" ? -2 : -1;
  else if (phrase.phase === "endgame") step = 1;
  else step = instrument === "cello" ? -2 : -1;
  return scaleStepMidi(game, midi, { ...noteSettings, instrument }, step);
}

function getSimpleBlendShape(tactics, phrase) {
  if (tactics.captures > 0) return { delay: 0.09, durationScale: 1.16, intensity: 0.24 };
  if (tactics.koLike || tactics.opponentAtari || tactics.ownAtari || tactics.fight) return { delay: 0.14, durationScale: 0.86, intensity: 0.16 };
  if (phrase.cadence) return { delay: 0.18, durationScale: 1.28, intensity: 0.14 };
  return { delay: 0.16, durationScale: 1, intensity: 0.12 };
}

function makePercussionNote(instrument, delay = 0, durationScale = 0.34, intensity = 0.34) {
  return {
    instrument,
    sampleName: percussionSamples[instrument],
    kind: "percussion",
    delay,
    durationScale,
    intensity,
  };
}

function getSimplePercussionNotes(tactics, phrase) {
  if (!isSimplePage() || !simplePercussionInput?.checked) return [];
  const notes = [];
  const tacticalOn = getTacticalSettings().mode !== "off";
  if (!tacticalOn) return [];
  const phraseOn = getMusicalIntelligenceSettings().phraseShaping;

  if (tactics.captures > 0) {
    notes.push(makePercussionNote("bass drum", 0.006, 0.3, 0.34));
    if (tactics.captures > 1) notes.push(makePercussionNote("tambourine", 0.09, 0.22, 0.18));
  } else if (tactics.koLike) {
    notes.push(makePercussionNote("triangle", 0.12, 0.52, 0.22));
  } else if (tactics.fight || tactics.opponentAtari || tactics.ownAtari) {
    notes.push(makePercussionNote(tactics.ownAtari ? "cowbell" : "djembe", 0.04, 0.28, 0.24));
  }

  if (phraseOn && phrase.phraseCadence) {
    const instrument = phrase.phase === "endgame" ? "suspended cymbal" : phrase.phase === "middle" ? "djembe" : "woodblock";
    notes.push(makePercussionNote(instrument, 0.18, phrase.phase === "endgame" ? 0.58 : 0.3, phrase.phase === "endgame" ? 0.2 : 0.18));
  } else if (phraseOn && phrase.barPosition === 0 && phrase.phase !== "endgame" && !notes.length) {
    notes.push(makePercussionNote(phrase.phase === "opening" ? "woodblock" : "agogo bells", 0.02, 0.24, 0.14));
  }

  return notes.slice(0, 2);
}

function makeMelodicNote(instrument, midi, delay = 0, intensity = 1) {
  return {
    instrument,
    sampleName: midiToSampleName(playableMidiForInstrument(midi, instrument)),
    kind: "melodic",
    midi,
    delay,
    durationScale: 1,
    intensity,
  };
}

function buildMelodicTextureNotes(melodicInstruments, chordNotes, flow) {
  if (!melodicInstruments.length) return [];
  const notes = chordNotes.length ? chordNotes : [];
  if (!notes.length) return [];

  if (flow.texture === "doubling") {
    return melodicInstruments.map((instrument) => makeMelodicNote(instrument, notes[0], 0, melodicInstruments.length > 1 ? 0.86 : 1));
  }

  if (flow.texture === "homophony") {
    const harmonyNotes = notes.slice(0, Math.max(1, Math.min(3, notes.length)));
    return melodicInstruments.flatMap((instrument, instrumentIndex) =>
      harmonyNotes.map((note, noteIndex) => makeMelodicNote(instrument, note, noteIndex * 0.012 + instrumentIndex * 0.008, noteIndex === 0 ? 0.9 : 0.64)),
    );
  }

  if (melodicInstruments.length === 1) return notes.map((note) => makeMelodicNote(melodicInstruments[0], note));
  return melodicInstruments.map((instrument, index) => {
    const note = notes[index % notes.length];
    const isLead = index === 0;
    return makeMelodicNote(instrument, note, index * 0.018, isLead ? 1 : 0.62);
  });
}

function updateTacticalState(state, tactics) {
  const next = {
    tension: state.tension * 0.58,
    release: state.release * 0.5,
    continuity: state.continuity * 0.72,
  };
  if (tactics.fight || tactics.opponentAtari || tactics.ownAtari) {
    next.tension = Math.min(1, next.tension + 0.46);
    next.continuity = Math.min(1, next.continuity + 0.34);
  }
  if (tactics.cut || tactics.invasion) next.tension = Math.min(1, next.tension + 0.22);
  if (tactics.connection) next.continuity = Math.min(1, next.continuity + 0.24);
  if (tactics.koLike) next.tension = Math.min(1, next.tension + 0.26);
  if (tactics.captures > 0) {
    next.release = Math.min(1, next.release + 0.72);
    next.tension *= 0.38;
    next.continuity = Math.min(1, next.continuity + 0.18);
  }
  return next;
}

function getGamePhase(game, index) {
  const progress = game.moves.length ? index / game.moves.length : 0;
  if (progress < 0.18) return "opening";
  if (progress > 0.78) return "endgame";
  return "middle";
}

function neutralTacticalExpression() {
  return { duration: 1, overlap: 1, brightness: 1, intensity: 1 };
}

function blendTacticalExpression(base, accent) {
  if (!accent) return base;
  return {
    duration: base.duration * 0.38 + accent.duration * 0.62,
    overlap: base.overlap * 0.38 + accent.overlap * 0.62,
    brightness: base.brightness * 0.35 + accent.brightness * 0.65,
    intensity: base.intensity * 0.35 + accent.intensity * 0.65,
  };
}

function getSimpleTacticalExpression(tactics) {
  if (tactics.captures > 0) return { duration: 0.88, overlap: 0.82, brightness: 1.12, intensity: 1.08 };
  if (tactics.koLike) return { duration: 1.1, overlap: 1.16, brightness: 0.94, intensity: 0.96 };
  if (tactics.fight || tactics.opponentAtari || tactics.ownAtari) return { duration: 1.08, overlap: 1.12, brightness: 0.92, intensity: 0.94 };
  return null;
}

function getSimpleDramaPace(tactics) {
  if (!isSimplePage() || !simpleFightingDramaInput?.checked) return null;
  if (tactics.captures > 0) return 0.9;
  if (tactics.koLike) return 1.1;
  if (tactics.fight || tactics.opponentAtari || tactics.ownAtari) return 1.12;
  return null;
}

function getPhraseProfile(game, index, tactics, tacticalState) {
  const intelligence = getMusicalIntelligenceSettings();
  const barLength = intelligence.barLength;
  const phraseLength = Math.max(barLength, barLength * intelligence.phraseBars);
  const phrasePosition = index % phraseLength;
  const barPosition = index % barLength;
  const phraseCadence = phrasePosition === phraseLength - 1;
  const barCadence = barPosition === barLength - 1;
  if (!intelligence.phraseShaping) {
    return {
      phase: "neutral",
      cadence: false,
      phraseCadence,
      barCadence,
      phrasePosition,
      barPosition,
      duration: 1,
      overlap: 1,
      brightness: 1,
      intensity: 1,
      pace: 1,
      positionStep: 0,
    };
  }
  const phase = getGamePhase(game, index);
  const simple = isSimplePage();
  const cadence = barCadence || phraseCadence || tactics.captures > 0;
  const phaseShape = {
    opening: { duration: 1.14, overlap: 1.18, brightness: 0.92, intensity: 0.9, pace: 1.08, positionStep: -1 },
    middle: { duration: 1, overlap: 1, brightness: 1.02, intensity: 1, pace: 1, positionStep: 0 },
    endgame: { duration: 0.94, overlap: 0.88, brightness: 1.08, intensity: 1.04, pace: 0.94, positionStep: 1 },
  }[phase];
  const tension = tacticalState.tension || 0;
  const release = tacticalState.release || 0;
  const positionStep = phaseShape.positionStep + (tactics.invasion ? 1 : 0) + (tactics.connection ? -1 : 0);
  const cadenceWeight = phraseCadence || tactics.captures > 0 ? 1 : barCadence ? 0.55 : 0;
  const downbeatAccent = simple && barPosition === 0 ? 1.035 : 1;
  return {
    phase,
    cadence,
    phraseCadence,
    barCadence,
    phrasePosition,
    barPosition,
    duration: phaseShape.duration * (1 + cadenceWeight * (simple ? 0.08 : 0.16)) * (1 + tension * (simple ? 0.04 : 0.08)),
    overlap: phaseShape.overlap * (1 + cadenceWeight * (simple ? 0.06 : 0.12)) * (1 + (tacticalState.continuity || 0) * (simple ? 0.07 : 0.14)),
    brightness: phaseShape.brightness * (1 + tension * (simple ? 0.05 : 0.12) - release * 0.06),
    intensity: phaseShape.intensity * downbeatAccent * (1 + release * (simple ? 0.06 : 0.12)),
    pace: simple ? 1 : phaseShape.pace * (1 + cadenceWeight * 0.08),
    positionStep: simple ? Math.max(-1, Math.min(1, positionStep)) : positionStep,
  };
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

function analyzeMoveTactics(game, board, move, moveResult) {
  const empty = {
    captures: moveResult.captures || 0,
    ownLiberties: moveResult.ownLiberties || 0,
    opponentAtari: false,
    ownAtari: false,
    fight: false,
    koLike: Boolean(moveResult.koLike || moveResult.repeatedPosition),
    repeatedPosition: Boolean(moveResult.repeatedPosition),
  };
  if (move.pass || !board[move.y]?.[move.x]) return empty;

  const opponent = move.color === "B" ? "W" : "B";
  const seenGroups = new Set();
  const friendlyGroups = new Set();
  let adjacentFriendly = 0;
  let adjacentOpponent = 0;
  let opponentAtari = false;
  let opponentLowLiberty = false;

  for (const [nx, ny] of neighbors(move.x, move.y, game.size)) {
    const stone = board[ny][nx];
    if (!stone) continue;
    const group = collectGroup(board, nx, ny);
    const key = group.stones.map(([sx, sy]) => `${sx},${sy}`).sort().join("|");
    if (stone === opponent) {
      adjacentOpponent += 1;
      if (seenGroups.has(key)) continue;
      seenGroups.add(key);
      if (group.liberties === 1) opponentAtari = true;
      if (group.liberties <= 2) opponentLowLiberty = true;
    } else {
      adjacentFriendly += 1;
      friendlyGroups.add(key);
    }
  }

  let localFriendly = 0;
  let localOpponent = 0;
  for (let y = Math.max(0, move.y - 2); y <= Math.min(game.size - 1, move.y + 2); y += 1) {
    for (let x = Math.max(0, move.x - 2); x <= Math.min(game.size - 1, move.x + 2); x += 1) {
      if (board[y][x] === move.color) localFriendly += 1;
      if (board[y][x] === opponent) localOpponent += 1;
    }
  }
  const edgeDistance = Math.min(move.x, move.y, game.size - 1 - move.x, game.size - 1 - move.y);
  const ownAtari = empty.ownLiberties === 1;
  const connection = friendlyGroups.size > 1;
  const cut = seenGroups.size > 1 && adjacentFriendly > 0;
  const invasion = edgeDistance >= 2 && localOpponent >= localFriendly + 2 && adjacentOpponent === 0;
  return {
    ...empty,
    opponentAtari,
    ownAtari,
    koLike: Boolean(empty.koLike || empty.repeatedPosition),
    connection,
    cut,
    invasion,
    localFriendly,
    localOpponent,
    fight: empty.captures > 0 || opponentLowLiberty || ownAtari || empty.ownLiberties === 2 || cut,
  };
}

function getTacticalAccents(tactics, settings, state = { tension: 0, release: 0 }) {
  if (settings.mode === "off") return [];
  const dramatic = settings.mode === "dramatic";
  const simple = isSimplePage();
  const notes = [];
  const tension = Math.max(state.tension, tactics.fight || tactics.ownAtari || tactics.opponentAtari ? 0.55 : 0);
  const release = Math.max(state.release, tactics.captures > 0 ? 0.72 : 0);

  if (tactics.fight) notes.push({ step: settings.fightInterval, label: "fight", delay: 0.04, durationScale: 0.74, intensity: 0.5 + tension * 0.32 });
  if (tactics.opponentAtari || tactics.ownAtari) notes.push({ step: tactics.ownAtari ? settings.atariInterval : -settings.atariInterval, label: "atari", delay: 0.08, durationScale: 0.56, intensity: 0.38 + tension * 0.28 });
  if (tactics.captures > 0) notes.push({ step: settings.captureInterval, label: "capture", delay: 0.02, durationScale: 1.05, intensity: 0.68 + release * 0.34 });
  if (tactics.koLike) {
    notes.push({ step: settings.koInterval, label: "ko", delay: 0.03, durationScale: 0.38, intensity: 0.42 + tension * 0.2 });
    notes.push({ step: 0, label: "ko", delay: 0.17, durationScale: 0.38, intensity: 0.36 + tension * 0.18 });
  }
  if (tactics.cut) notes.push({ step: -Math.max(1, Math.abs(settings.atariInterval)), label: "cut", delay: 0.1, durationScale: 0.58, intensity: 0.34 + tension * 0.18 });
  if (tactics.connection && release < 0.6) notes.push({ step: -1, label: "connection", delay: 0.12, durationScale: 0.9, intensity: 0.26 });
  if (tactics.invasion) notes.push({ step: 1, label: "invasion", delay: 0.13, durationScale: 0.7, intensity: 0.32 + tension * 0.16 });
  if (dramatic && tension > 0.55) notes.push({ step: Math.sign(settings.fightInterval || 1) * 4, label: "fight", delay: 0.14, durationScale: 0.7, intensity: 0.38 + tension * 0.24 });
  if (!dramatic && notes.length > 1 && release < 0.5) {
    notes.sort((a, b) => b.intensity - a.intensity);
  }

  if (simple) {
    const priority = { capture: 4, ko: 3, atari: 2, fight: 1, cut: 1, invasion: 1, connection: 0 };
    const primary = notes
      .filter((note) => ["capture", "ko", "atari", "fight"].includes(note.label))
      .sort((a, b) => (priority[b.label] || 0) - (priority[a.label] || 0) || b.intensity - a.intensity)
      .slice(0, 1);
    if (settings.mode !== "off" && tension > 0.72 && (tactics.fight || tactics.opponentAtari || tactics.ownAtari)) {
      primary.push({ step: 2, label: "fight-harmony", delay: 0.18, durationScale: 0.82, intensity: 0.22 + tension * 0.12 });
    }
    return primary.slice(0, 2);
  }

  return notes.slice(0, dramatic ? 5 : 3);
}

function buildTacticalNotes(game, midi, tactics, settings, melodicInstruments, tacticalState) {
  const tacticalSettings = getTacticalSettings();
  const accents = getTacticalAccents(tactics, tacticalSettings, tacticalState);
  if (!accents.length || !melodicInstruments.length) return [];

  const poolSettings = { ...settings, instrument: melodicInstruments[0] };
  return accents.flatMap((accent) => {
    const target = scaleStepMidi(game, midi, poolSettings, accent.step);
    return melodicInstruments.map((instrument) => ({
      instrument,
      sampleName: midiToSampleName(playableMidiForInstrument(target, instrument)),
      kind: "tactical",
      label: accent.label,
      delay: accent.delay,
      durationScale: accent.durationScale,
      intensity: tacticalSettings.intensity * accent.intensity,
      midi: target,
    }));
  });
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
    { value: "chinese-pentatonic", label: "Chinese pentatonic" },
    { value: "japanese-hirajoshi", label: "Japanese Hirajoshi" },
    { value: "japanese-insen", label: "Japanese Insen" },
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
    { value: "dorian", label: "Dorian" },
    { value: "mixolydian", label: "Mixolydian" },
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
          <select class="region-scale">${createOptions(scales, "korean-pentatonic")}</select>
        </label>
        <label class="field">
          <span>Chord</span>
          <select class="region-chord">${createOptions(chords, "none")}</select>
        </label>
        <label class="field">
          <span>Music map</span>
          <select class="region-music-mode">${createOptions(musicModes, "goto-music-move37")}</select>
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
    const variant = getSimpleMusicTypeSettings();
    const instrument = move.color === "B" ? blackInstrumentInput?.value || "piano" : whiteInstrumentInput?.value || "guitar";
    return {
      instrument,
      instruments: [instrument],
      scale: variant.scale,
      chord: chordInput.value,
      musicMode: variant.musicMode,
      register: variant.register,
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
  if (!decoded.has(key)) {
    let audioCache = decodedSampleBuffers.get(audio);
    if (!audioCache) {
      audioCache = new Map();
      decodedSampleBuffers.set(audio, audioCache);
    }
    if (!audioCache.has(key)) audioCache.set(key, await getSampleBuffer(audio, instrument, sampleName));
    decoded.set(key, audioCache.get(key));
  }
  return decoded.get(key);
}

function buildMoveEntry(game, board, move, index, moveResult, tacticalState = { tension: 0, release: 0, continuity: 0 }, previousMidi = null) {
  const flow = getFlowSettings();
  const settings = getRegionSettings(move, game);
  const rangeSettings = getRangeSettings(index + 1);
  const captures = moveResult.captures || 0;
  const layerInstruments = rangeSettings.instruments.length ? [...(settings.instruments || [settings.instrument]), ...rangeSettings.instruments] : settings.instruments || [settings.instrument];
  const uniqueInstruments = [...new Set(layerInstruments)];
  const melodicInstruments = uniqueInstruments.filter((name) => melodicInstrumentNames.includes(name));
  const percussionInstruments = uniqueInstruments.filter((name) => percussionSamples[name]);
  const leadInstrument = melodicInstruments[0] || "piano";
  const tactics = analyzeMoveTactics(game, board, move, moveResult);
  const phrase = getPhraseProfile(game, index, tactics, tacticalState);
  const noteSettings = getExpressiveSimpleSettings({ ...settings, instrument: leadInstrument, board }, tactics, phrase);
  const rawMidi = noteForMove(game, move, index, captures, noteSettings, phrase);
  const simpleMaxStep = getSimpleMusicTypeSettings().maxStep;
  const midi = isSimplePage() ? smoothMelodyMidi(game, rawMidi, previousMidi, noteSettings, simpleMaxStep) : rawMidi;
  const gotoMusic = settings.musicMode === "goto-music-move37" ? { ...noteForGotoMusicMove(game, move, noteSettings, phrase), midi, label: midiToDisplayName(midi) } : null;
  const chord = chordForMidi(game, midi, noteSettings);
  const textureNotes = chord.length ? chord : [midi];
  const simpleBlendInstruments = getSimpleBlendInstruments(leadInstrument, tactics, phrase);
  const melodicNotes = buildMelodicTextureNotes(melodicInstruments, textureNotes, flow);
  const blendNotes = simpleBlendInstruments.flatMap((instrument) => {
    const blendTone = getSimpleBlendTone(game, midi, noteSettings, instrument, tactics, phrase);
    const blendShape = getSimpleBlendShape(tactics, phrase);
    return [
      {
        instrument,
        sampleName: midiToSampleName(playableMidiForInstrument(blendTone, instrument)),
        kind: "blend",
        midi: blendTone,
        delay: blendShape.delay,
        durationScale: blendShape.durationScale,
        intensity: blendShape.intensity,
      },
    ];
  });
  const tacticalNotes = buildTacticalNotes(game, midi, tactics, noteSettings, melodicInstruments, tacticalState);
  const displayLabel = describeMoveNotes([...melodicNotes.map((note) => note.midi), ...tacticalNotes.map((note) => note.midi)], midi);
  const percussionNotes = percussionInstruments.map((instrument) => makePercussionNote(instrument, 0, 1, 1));
  const simplePercussionNotes = getSimplePercussionNotes(tactics, phrase);
  return {
    move,
    moveNumber: index + 1,
    captures,
    midi,
    gotoMusic,
    displayLabel,
    tactics,
    phrase,
    settings: noteSettings,
    rangeSettings,
    flow,
    chordSize: Math.max(1, melodicNotes.length + blendNotes.length + percussionNotes.length + simplePercussionNotes.length),
    notes: [...melodicNotes, ...blendNotes, ...tacticalNotes, ...percussionNotes, ...simplePercussionNotes],
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
  const intensity = articulation.intensity ?? 1;
  const peak = (0.34 + Math.min(captures, 3) * 0.038) * volume * chordTrim * profile.volume * intensity;
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
  let tacticalPaceBoost = null;
  let simpleTacticalExpressionCarry = null;
  let simpleDramaPaceCarry = null;
  let tacticalState = { tension: 0, release: 0, continuity: 0 };
  let previousLeadMidi = null;
  const boardHashes = new Set([boardHash(board)]);
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
    const previousBoardHash = boardHash(board);
    const result = applyMove(board, move);
    result.previousBoardHash = previousBoardHash;
    result.boardHash = boardHash(board);
    result.repeatedPosition = boardHashes.has(result.boardHash);
    boardHashes.add(result.boardHash);
    const entry = buildMoveEntry(game, board, move, index, result, tacticalState, previousLeadMidi);
    previousLeadMidi = entry.midi;
    tacticalState = updateTacticalState(tacticalState, entry.tactics);
    const rangeSettings = entry.rangeSettings;
    const flow = entry.flow;
    const profile = getMoodProfile(entry.settings.mood !== "neutral" ? entry.settings.mood : rangeSettings.mood);
    const tacticalSettings = getTacticalSettings();
    let tacticalExpression = neutralTacticalExpression();
    let movePace = Math.max(0.22, rangeSettings.pace || Number(paceInput.value)) * entry.phrase.pace;
    if (isSimplePage()) {
      const currentDramaPace = tacticalSettings.mode === "off" ? null : getSimpleDramaPace(entry.tactics);
      if (currentDramaPace) {
        simpleDramaPaceCarry = { multiplier: currentDramaPace, remaining: tacticalSettings.paceCarry };
        movePace *= currentDramaPace;
      } else if (simpleDramaPaceCarry?.remaining > 0 && tacticalSettings.mode !== "off" && simpleFightingDramaInput?.checked) {
        movePace *= simpleDramaPaceCarry.multiplier;
        simpleDramaPaceCarry.remaining -= 1;
        if (simpleDramaPaceCarry.remaining <= 0) simpleDramaPaceCarry = null;
      } else if (simpleDramaPaceCarry && (tacticalSettings.mode === "off" || !simpleFightingDramaInput?.checked)) {
        simpleDramaPaceCarry = null;
      }
      if (simpleTacticalExpressionCarry?.remaining > 0) {
        tacticalExpression = simpleTacticalExpressionCarry.expression;
        simpleTacticalExpressionCarry.remaining -= 1;
        if (simpleTacticalExpressionCarry.remaining <= 0) simpleTacticalExpressionCarry = null;
      }
      const currentExpression = tacticalSettings.mode === "off" ? null : getSimpleTacticalExpression(entry.tactics);
      if (currentExpression) {
        tacticalExpression = blendTacticalExpression(tacticalExpression, currentExpression);
        simpleTacticalExpressionCarry = { expression: currentExpression, remaining: tacticalSettings.paceCarry };
      }
    } else if (tacticalPaceBoost?.remaining > 0) {
      movePace *= tacticalPaceBoost.multiplier;
      tacticalPaceBoost.remaining -= 1;
      if (tacticalPaceBoost.remaining <= 0) tacticalPaceBoost = null;
    }
    if (!isSimplePage() && entry.tactics.captures > 0) {
      const capturePace = tacticalSettings.capturePace;
      tacticalPaceBoost = { multiplier: capturePace, remaining: tacticalSettings.paceCarry };
      movePace *= capturePace;
    } else if (!isSimplePage() && (entry.tactics.fight || entry.tactics.opponentAtari || entry.tactics.ownAtari)) {
      const fightPace = tacticalSettings.fightPace;
      tacticalPaceBoost = { multiplier: fightPace, remaining: tacticalSettings.paceCarry };
      movePace *= fightPace;
    }
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
    const isFinalMove = index === game.moves.length - 1;
    const finalTail = isFinalMove ? 2.4 : 1;
    const noteDuration = movePace * Number(noteLengthInput.value) * profile.duration * connectionShape.duration * structureShape.duration * entry.phrase.duration * tacticalExpression.duration * (isFinalMove ? 1.35 : 1);
    const noteOverlap = Math.min(
      movePace * 0.68 * profile.overlap * connectionShape.overlap * structureShape.overlap * entry.phrase.overlap * tacticalExpression.overlap * finalTail,
      isFinalMove ? 3.2 : isLegato ? 1.65 : 1.15,
    );
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
      const kindTrim = note.kind === "tactical" ? 0.58 : note.kind === "blend" ? 1 : 1;
      const noteIntensity = kindTrim * (note.intensity ?? 1) * entry.phrase.intensity * tacticalExpression.intensity;
      const phraseProfile = { ...profile, brightness: profile.brightness * entry.phrase.brightness * tacticalExpression.brightness };
      const scheduledTime = audio.currentTime + 0.014 + chordIndex * connectionShape.stagger + (note.delay || 0);
      playNote(
        audio,
        audioOutput,
        sample,
        scheduledTime,
        noteDuration * (note.durationScale || 1),
        move.color,
        result.captures,
        noteOverlap * (note.durationScale || 1),
        note.kind === "tactical" ? Math.max(1, entry.chordSize + 1) : entry.chordSize,
        phraseProfile,
        { legato: isLegato, intensity: noteIntensity },
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
  await wait(record || hadDrone || getFlowSettings().connection === "legato" ? 2200 : 1500);
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
