import { drawWinrateGraph } from "./analysis.js";

// Palettes and board controls adapted from the standalone SGF Postcards editor.
const palettes = {
  gold: ["#efc225", "#25252f", "#30303d", "#15151e", "#25252f", "#efc225", "#f8f8ff", "#b3b3c1", "outlined"],
  jade: ["#76d6b3", "#172c29", "#26403b", "#10221e", "#172c29", "#76d6b3", "#effbf4", "#a4c1b5", "outlined"],
  sakura: ["#f2a6c3", "#302331", "#483245", "#211721", "#302331", "#f2a6c3", "#fff1f7", "#c9aebd", "outlined"],
  ice: ["#86c7ef", "#1c2938", "#2d4055", "#111c29", "#1c2938", "#86c7ef", "#f0f7ff", "#aac0d2", "outlined"],
  paper: ["#766445", "#f3efdf", "#e7e0c9", "#b9ad8e", "#262722", "#fffdf5", "#292c27", "#726f60", "flat"],
  classic: ["#694b27", "#d4ae71", "#e9cc92", "#31200d", "#17181c", "#fffaf0", "#2e281d", "#665438", "shaded"],
};
const colorKeys = ["accent", "background", "panel", "gridColor", "black", "white", "text", "muted"];
const schema = {
  surface: { group: "Colors & stones", label: "Board surface", type: "select", default: "photo", id: "textureInput", options: [["photo", "Photo board"], ["theme", "Theme colors"]] },
  preset: { group: "Colors & stones", label: "Color preset", type: "select", default: "classic", options: [["classic", "Classic board"], ["gold", "Midnight gold"], ["jade", "Jade"], ["sakura", "Sakura"], ["ice", "Glacier"], ["paper", "Paper"], ["custom", "Custom"]] },
  ...Object.fromEntries(colorKeys.map((key, i) => [key, {
    group: "Colors & stones", label: ["Accent / outline", "Background", "Gradient end", "Grid lines", "Black stones", "White stones", "Heading text", "Detail text"][i], type: "color", default: palettes.classic[i],
  }])),
  stoneStyle: { group: "Colors & stones", label: "Stone style", type: "select", default: "photo", options: [["photo", "Photo stones"], ["outlined", "Outlined Black / solid White"], ["flat", "Both solid"], ["rings", "Both outlined"], ["shaded", "Shaded stones"]] },
  gradient: { group: "Colors & stones", label: "Gradient background", type: "checkbox", default: true },
  coordinates: { group: "Board & annotations", label: "Coordinates", type: "checkbox", default: false },
  grid: { group: "Board & annotations", label: "Show grid", type: "checkbox", default: true },
  stars: { group: "Board & annotations", label: "Star points", type: "checkbox", default: true },
  gridOpacity: { group: "Board & annotations", label: "Grid opacity", type: "range", default: 78, min: 0, max: 100, step: 1, unit: "%" },
  stoneSize: { group: "Board & annotations", label: "Stone size", type: "range", default: 46, min: 30, max: 49, step: 1, unit: "%" },
  outline: { group: "Board & annotations", label: "Outline thickness", type: "range", default: 5, min: 1, max: 12, step: 1, unit: "%" },
  numbers: { group: "Board & annotations", label: "Move numbers", type: "select", default: "none", options: [["none", "None"], ["last10", "Last 10 surviving moves"], ["all", "All surviving moves"]] },
  lastMove: { group: "Board & annotations", label: "Mark the last move", type: "checkbox", default: true },
  rotation: { group: "View & framing", label: "Board rotation", type: "select", default: "0", options: [["0", "0°"], ["90", "90° clockwise"], ["180", "180°"], ["270", "270° clockwise"]] },
  zoom: { group: "View & framing", label: "Board zoom", type: "range", default: 100, min: 100, max: 220, step: 5, unit: "%" },
  margin: { group: "View & framing", label: "Frame margin", type: "range", default: 4, min: 0, max: 8, step: 1, unit: "%" },
  radius: { group: "View & framing", label: "Corner radius", type: "range", default: 0, min: 0, max: 12, step: 1, unit: "%" },
  border: { group: "View & framing", label: "Frame border", type: "checkbox", default: false },
  font: { group: "Text", label: "Typeface", type: "select", default: "serif", options: [["sans", "System sans serif"], ["serif", "Serif"], ["mono", "Monospace"]] },
  fontScale: { group: "Text", label: "Text size", type: "range", default: 100, min: 80, max: 140, step: 5, unit: "%" },
  showTitle: { group: "Text", label: "Show game title and event", type: "checkbox", default: true },
  showDetails: { group: "Text", label: "Show result, rules and komi", type: "checkbox", default: true },
  showInfo: { group: "Text", label: "Show players and date", type: "checkbox", default: true },
  showPosition: { group: "Text", label: "Show move count", type: "checkbox", default: true },
  showNotes: { group: "Text", label: "Show musical notes", type: "checkbox", default: true },
};
const defaults = Object.fromEntries(Object.entries(schema).map(([key, spec]) => [key, spec.default]));
const storageKey = "sgf2mv-visuals-v1";

export function createVisualControls(container, onChange) {
  const settings = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    for (const [key, spec] of Object.entries(schema)) {
      const value = saved?.[key];
      if (spec.type === "checkbox" && typeof value === "boolean") settings[key] = value;
      if (spec.type === "color" && typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) settings[key] = value;
      if (spec.type === "select" && spec.options.some(([option]) => option === value)) settings[key] = value;
      if (spec.type === "range" && Number.isFinite(value)) settings[key] = Math.max(spec.min, Math.min(spec.max, Math.round(value / spec.step) * spec.step));
    }
    if (typeof saved?.showTitle !== "boolean" && typeof saved?.showDetails === "boolean") settings.showTitle = saved.showDetails;
  } catch { /* Use defaults when browser storage is unavailable. */ }
  const groups = new Map();
  const inputs = new Map();
  const outputs = new Map();
  const sync = () => {
    for (const [key, input] of inputs) {
      if (schema[key].type === "checkbox") input.checked = settings[key];
      else input.value = settings[key];
      if (outputs.has(key)) outputs.get(key).textContent = `${settings[key]}${schema[key].unit}`;
    }
  };
  const update = () => {
    sync();
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Storage is optional. */ }
    onChange();
  };
  for (const [key, spec] of Object.entries(schema)) {
    if (!groups.has(spec.group)) {
      const section = document.createElement("details");
      section.className = "visual-section";
      section.open = groups.size === 0;
      const summary = document.createElement("summary");
      summary.textContent = spec.group;
      const fields = document.createElement("div");
      fields.className = "visual-fields";
      section.append(summary, fields);
      container.append(section);
      groups.set(spec.group, fields);
    }
    const label = document.createElement("label");
    label.className = `field${spec.type === "checkbox" ? " field-inline" : ""}${spec.type === "color" ? " visual-color" : ""}`;
    const title = document.createElement("span");
    title.textContent = spec.label;
    const input = document.createElement(spec.type === "select" ? "select" : "input");
    input.id = spec.id || `visual-${key}`;
    input.dataset.visual = key;
    if (spec.type === "select") {
      for (const [value, text] of spec.options) input.add(new Option(text, value));
    } else {
      input.type = spec.type;
    }
    if (spec.type === "range") {
      Object.assign(input, { min: spec.min, max: spec.max, step: spec.step });
      const output = document.createElement("output");
      output.htmlFor = input.id;
      outputs.set(key, output);
      title.append(" ", output);
    }
    if (spec.type === "checkbox") label.append(input, title);
    else label.append(title, input);
    groups.get(spec.group).append(label);
    inputs.set(key, input);
    input.addEventListener("input", () => {
      settings[key] = spec.type === "checkbox" ? input.checked : spec.type === "range" ? Number(input.value) : input.value;
      if (key === "preset" && palettes[settings.preset]) {
        const palette = palettes[settings.preset];
        colorKeys.forEach((name, i) => { settings[name] = palette[i]; });
        settings.stoneStyle = palette[8];
        settings.surface = "theme";
        settings.gradient = true;
      } else if (colorKeys.includes(key) || key === "stoneStyle") {
        settings.preset = "custom";
        if (key === "background" || key === "panel") settings.surface = "theme";
        if ((key === "black" || key === "white") && settings.stoneStyle === "photo") settings.stoneStyle = "shaded";
      }
      update();
    });
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "secondary-button";
  reset.textContent = "Reset visuals";
  reset.addEventListener("click", () => { Object.assign(settings, defaults); update(); });
  container.append(reset);
  sync();
  return settings;
}

function luminance(hex) {
  const rgb = hex.match(/\w\w/g).map((part) => parseInt(part, 16) / 255).map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a, b) {
  const first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function contrast(hex) {
  return luminance(hex) > 0.3 ? "#15151b" : "#ffffff";
}

function mix(hex, other, amount) {
  const a = hex.match(/\w\w/g).map((n) => parseInt(n, 16)), b = other.match(/\w\w/g).map((n) => parseInt(n, 16));
  return "#" + a.map((n, i) => Math.round(n * (1 - amount) + b[i] * amount).toString(16).padStart(2, "0")).join("");
}

function drawStone(ctx, x, y, radius, color, texture, settings, gap) {
  const fill = color === "B" ? settings.black : settings.white;
  ctx.save();
  if (settings.stoneStyle === "photo" && texture?.complete && texture.naturalWidth > 0) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = radius * 0.24;
    ctx.shadowOffsetY = radius * 0.14;
    ctx.drawImage(texture, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
    return color === "B" ? "#17181c" : "#fffaf0";
  }
  const rings = settings.stoneStyle === "rings";
  const outlined = rings || (settings.stoneStyle === "outlined" && color === "B");
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (settings.stoneStyle === "shaded" || settings.stoneStyle === "photo") {
    const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.4, radius * 0.05, x, y, radius);
    gradient.addColorStop(0, mix(fill, "#ffffff", 0.32));
    gradient.addColorStop(0.6, fill);
    gradient.addColorStop(1, mix(fill, "#000000", 0.28));
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = rings ? settings.background : fill;
  }
  ctx.fill();
  const backgrounds = [settings.background, settings.gradient ? settings.panel : settings.background];
  const needsEdge = Math.min(...backgrounds.map((background) => contrastRatio(fill, background))) < 1.6;
  if (outlined || needsEdge) {
    let edge = outlined ? (color === "B" ? settings.accent : settings.white) : settings.accent;
    if (Math.min(...backgrounds.map((background) => contrastRatio(edge, background))) < 1.6) edge = contrast(fill);
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(gap * settings.outline / 100, radius * 0.045);
    ctx.stroke();
  }
  ctx.restore();
  return rings ? settings.background : fill;
}

export function drawVisualBoard({ ctx, canvas, board, activeMove, progress, game, title, activeEntry, settings, analysis, boardTexture, textureAt }) {
  const width = canvas.width, size = board.length;
  const margin = width * settings.margin / 100;
  const textScale = settings.fontScale / 100;
  const boardSpacing = width * 0.025 * Math.max(1, textScale);
  const verticalTitle = settings.showTitle && game ? [game.title, game.event !== game.title ? game.event : ""].filter(Boolean).join(" · ") : "";
  const verticalDetails = settings.showDetails && game ? [game.result ? `Recorded result: ${game.result}` : "", game.rules, game.komi ? `Komi ${game.komi}` : ""].filter(Boolean).join(" · ") : "";
  const sideGutter = boardSpacing + Math.max(verticalTitle ? width * 0.03 * textScale : 0, verticalDetails ? width * 0.024 * textScale : 0);
  const badge = [settings.showPosition && game ? `Move ${board.moveNumber || 0} of ${game.moves.length}` : "", settings.showNotes ? activeEntry?.displayLabel : ""].filter(Boolean).join(": ");
  const graphHeight = analysis?.showGraph && analysis.points.some(Number.isFinite) ? width * 0.085 * Math.max(1, textScale) : 0;
  const positionHeight = badge && !graphHeight ? width * 0.03 * textScale : 0;
  const playersHeight = settings.showInfo ? width * 0.035 * textScale : 0;
  const bandsHeight = graphHeight + positionHeight + playersHeight + 2 * boardSpacing;
  const frame = Math.min(width - 2 * Math.max(margin, sideGutter), width - margin - bandsHeight);
  const graphY = (width - frame - bandsHeight) / 2;
  const left = (width - frame) / 2, top = graphY + graphHeight + positionHeight + boardSpacing;
  const edgeRoom = 0.6;
  const pad = frame * Math.max(settings.coordinates ? 0.085 : 0.045, edgeRoom / (size - 1 + 2 * edgeRoom));
  const gap = (frame - 2 * pad) / (size - 1);
  const fontFamily = { sans: "system-ui, sans-serif", serif: "Georgia, serif", mono: "monospace" }[settings.font];
  const at = (x, y) => {
    const [a, b] = settings.rotation === "90" ? [size - 1 - y, x] : settings.rotation === "180" ? [size - 1 - x, size - 1 - y] : settings.rotation === "270" ? [y, size - 1 - x] : [x, y];
    return [left + pad + a * gap, top + pad + b * gap];
  };
  ctx.save();
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, width, width);
  ctx.beginPath();
  ctx.roundRect(left, top, frame, frame, width * settings.radius / 100);
  ctx.clip();
  if (settings.surface === "photo" && boardTexture.complete && boardTexture.naturalWidth > 0) {
    ctx.drawImage(boardTexture, left, top, frame, frame);
  } else {
    const gradient = ctx.createLinearGradient(left, top, left + frame, top + frame);
    gradient.addColorStop(0, settings.background);
    gradient.addColorStop(1, settings.gradient ? settings.panel : settings.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(left, top, frame, frame);
  }
  ctx.save();
  ctx.translate(width / 2, top + frame / 2);
  ctx.scale(settings.zoom / 100, settings.zoom / 100);
  ctx.translate(-width / 2, -top - frame / 2);
  ctx.save();
  ctx.globalAlpha = settings.gridOpacity / 100;
  ctx.strokeStyle = settings.gridColor;
  ctx.fillStyle = settings.gridColor;
  ctx.lineWidth = Math.max(1, width * 0.0018);
  if (settings.grid) {
    ctx.beginPath();
    for (let i = 0; i < size; i += 1) {
      ctx.moveTo(...at(0, i)); ctx.lineTo(...at(size - 1, i));
      ctx.moveTo(...at(i, 0)); ctx.lineTo(...at(i, size - 1));
    }
    ctx.stroke();
  }
  const stars = size === 19 ? [3, 9, 15].flatMap((x) => [3, 9, 15].map((y) => [x, y])) : size === 13 ? [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]] : size === 9 ? [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]] : [];
  if (settings.stars) {
    for (const [x, y] of stars) {
      ctx.beginPath(); ctx.arc(...at(x, y), gap * 0.1, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  if (settings.coordinates) {
    ctx.font = `550 ${Math.min(width * 0.022, gap * 0.34)}px ${fontFamily}`;
    ctx.fillStyle = settings.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const offset = Math.min(0.75, pad * 0.5 / gap);
    const labels = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < size; i += 1) {
      for (const edge of [-offset, size - 1 + offset]) {
        ctx.fillText(labels[i] || String(i + 1), ...at(i, edge));
        ctx.fillText(String(size - i), ...at(edge, i));
      }
    }
  }
  if (analysis?.territory.length) {
    ctx.save();
    for (const { x, y, color, strength = 1 } of analysis.territory) {
      if (strength < 0.12) continue;
      const [px, py] = at(x, y);
      ctx.globalAlpha = 0.36 * strength;
      ctx.fillStyle = color === "B" ? "#60a5fa" : "#fb923c";
      ctx.fillRect(px - gap * 0.45, py - gap * 0.45, gap * 0.9, gap * 0.9);
    }
    ctx.restore();
  }
  const lastMove = activeMove || board.lastMove;
  const radius = gap * settings.stoneSize / 100;
  board.forEach((row, y) => row.forEach((stone, x) => {
    if (!stone) return;
    const [px, py] = at(x, y);
    const active = activeMove && !activeMove.pass && activeMove.x === x && activeMove.y === y;
    const r = radius * (active ? 0.85 + progress * 0.15 : 1);
    const fill = drawStone(ctx, px, py, r, stone, textureAt(stone, x, y), settings, gap);
    const number = board.placed?.[y][x];
    if (number && (settings.numbers === "all" || (settings.numbers === "last10" && number > board.moveNumber - 10))) {
      ctx.font = `650 ${r * (number >= 100 ? 0.85 : 1.05)}px ${fontFamily}`;
      ctx.fillStyle = contrast(fill);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(number, px, py + r * 0.04);
    } else if (settings.lastMove && lastMove && !lastMove.pass && lastMove.x === x && lastMove.y === y && number === board.moveNumber) {
      ctx.beginPath(); ctx.arc(px, py, r * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = contrast(fill); ctx.lineWidth = Math.max(1, gap * 0.045); ctx.stroke();
    }
  }));
  if (analysis?.dead.length) {
    ctx.save();
    for (const { x, y } of analysis.dead) {
      const [px, py] = at(x, y), r = radius * 0.55;
      ctx.beginPath(); ctx.moveTo(px - r, py - r); ctx.lineTo(px + r, py + r); ctx.moveTo(px + r, py - r); ctx.lineTo(px - r, py + r);
      ctx.strokeStyle = "#15151b"; ctx.lineWidth = Math.max(2, gap * 0.14); ctx.stroke();
      ctx.strokeStyle = "#f87171"; ctx.lineWidth = Math.max(1, gap * 0.07); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
  // Text has dedicated bands outside the board's clip and zoom.
  ctx.save();
  const captionSize = (fraction) => width * fraction * textScale;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (badge && !graphHeight) {
    ctx.font = `700 ${captionSize(0.021)}px ${fontFamily}`;
    ctx.fillStyle = settings.text;
    const topCaptionY = top - boardSpacing - ctx.measureText(badge).actualBoundingBoxDescent;
    ctx.fillText(badge, width / 2, topCaptionY, frame * 0.9);
  }
  if (settings.showInfo) {
    ctx.font = `700 ${captionSize(0.02)}px ${fontFamily}`;
    const playerAscent = Math.max(ctx.measureText(title.black).actualBoundingBoxAscent, ctx.measureText(title.white).actualBoundingBoxAscent);
    const bottomCaptionY = top + frame + boardSpacing + playerAscent;
    ctx.fillStyle = settings.text;
    ctx.textAlign = "left";
    ctx.fillText(title.black, left + frame * 0.02, bottomCaptionY, frame * 0.35);
    ctx.textAlign = "right";
    ctx.fillText(title.white, left + frame * 0.98, bottomCaptionY, frame * 0.35);
    ctx.textAlign = "center";
    ctx.font = `500 ${captionSize(0.016)}px ${fontFamily}`;
    ctx.fillStyle = settings.muted;
    ctx.fillText(title.date, width / 2, bottomCaptionY, frame * 0.24);
  }
  ctx.restore();
  if (settings.border) {
    ctx.save();
    ctx.strokeStyle = settings.accent; ctx.lineWidth = Math.max(1, width * 0.002);
    const inset = ctx.lineWidth / 2;
    ctx.beginPath(); ctx.roundRect(left + inset, top + inset, frame - 2 * inset, frame - 2 * inset, width * settings.radius / 100); ctx.stroke();
    ctx.restore();
  }
  for (const side of [
    { text: verticalTitle, direction: -1, edge: left, font: `700 ${width * 0.024 * textScale}px ${fontFamily}`, color: settings.text },
    { text: verticalDetails, direction: 1, edge: left + frame, font: `400 ${width * 0.018 * textScale}px ${fontFamily}`, color: settings.muted },
  ]) {
    if (!side.text) continue;
    ctx.save();
    ctx.font = side.font;
    ctx.fillStyle = side.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = fitText(ctx, side.text, frame * 0.92);
    const offset = boardSpacing + ctx.measureText(text).actualBoundingBoxDescent;
    ctx.translate(side.edge + side.direction * offset, top + frame / 2);
    ctx.rotate(side.direction * Math.PI / 2);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  if (graphHeight) drawWinrateGraph(ctx, { x: left, y: graphY, width: frame, height: graphHeight, analysis, colors: settings, positionLabel: badge });
}

function fitText(ctx, value, maxWidth) {
  const text = value.replace(/\s+/g, " ");
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = Array.from(text);
  let low = 0, high = chars.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (ctx.measureText(chars.slice(0, middle).join("") + "…").width <= maxWidth) low = middle;
    else high = middle - 1;
  }
  return chars.slice(0, low).join("") + "…";
}
