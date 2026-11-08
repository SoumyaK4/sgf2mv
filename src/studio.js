import { readStoredSettings, writeStoredSettings, controlValue, restoreControl } from "./preferences.js";

const metadataFields = {
  title: "Game title", event: "Event", black: "Black player", blackRank: "Black rank",
  white: "White player", whiteRank: "White rank", date: "Date", komi: "Komi",
  result: "Recorded result", rules: "Rules",
};
const sampleSgf = "(;GM[1]FF[4]CA[UTF-8]SZ[9]GN[Handicap example]PB[Black]PW[White]HA[2]KM[0.5]AB[cc][gg];W[gc];B[cg];W[ee];B[ce];W[ge];B[ec];W[eg];B[dd];W[fd];B[df];W[ff];B[])";

export function createStudio(callbacks) {
  const loader = document.createElement("div");
  loader.className = "load-tools";
  loader.innerHTML = `<p class="small">Drop an SGF anywhere here, or choose a file.</p>
    <button id="sampleButton" type="button" class="secondary-button">Try an example</button>
    <details><summary>Paste SGF</summary><label class="field"><span>SGF text</span>
      <textarea id="sgfTextInput" rows="5" spellcheck="false" placeholder="(;GM[1]SZ[19];B[dd]…)" maxlength="20971520"></textarea></label>
      <button id="loadTextButton" type="button" class="secondary-button">Load pasted SGF</button></details>`;
  document.querySelector(".upload").after(loader);
  const timeline = document.createElement("div");
  timeline.className = "timeline";
  timeline.innerHTML = `<input id="positionInput" type="range" min="0" max="0" value="0" step="1" disabled aria-label="Preview move">`;
  document.querySelector(".stage").append(timeline);
  const exportSection = document.createElement("details");
  exportSection.className = "settings-group";
  exportSection.innerHTML = `<summary>Clip & Timing</summary>
    <label class="field field-inline"><input id="clipEnabledInput" type="checkbox" disabled><span>Use a move range</span></label>
    <fieldset id="clipFields" disabled><div class="field-grid"><label class="field"><span>First move</span><input id="clipStartInput" type="number" min="1" value="1" step="1"></label>
      <label class="field"><span>Last move</span><input id="clipEndInput" type="number" min="1" value="1" step="1"></label></div>
      <div class="field-grid"><button id="clipStartHereButton" type="button" class="secondary-button">Start after preview</button><button id="clipEndHereButton" type="button" class="secondary-button">End at preview</button></div></fieldset>
    <p id="clipNote" class="small">The full game will be exported.</p>
    <div class="field-grid"><label class="field"><span>Opening hold (seconds)</span><input id="introInput" type="number" min="0" max="30" step="0.5" value="2"></label>
      <label class="field"><span>Ending hold (seconds)</span><input id="outroInput" type="number" min="0" max="30" step="0.5" value="3"></label></div>
    <label class="field field-inline"><input id="preserveTailInput" type="checkbox" checked><span>Let final notes finish fading</span></label>
    <p class="small">The ending hold can extend to preserve the audio tail.</p>`;
  const metadataSection = document.createElement("details");
  metadataSection.className = "settings-group";
  metadataSection.innerHTML = `<summary>Game Details</summary><p class="small">Edit the text in your video. The original SGF stays unchanged.</p><fieldset id="metadataFields" disabled><div class="field-grid"></div><button id="restoreMetadataButton" class="secondary-button" type="button">Restore SGF details</button></fieldset>`;
  const fields = metadataSection.querySelector(".field-grid");
  for (const [key, title] of Object.entries(metadataFields)) {
    const label = document.createElement("label"); label.className = "field";
    const span = document.createElement("span"); span.textContent = title;
    const input = document.createElement("input");
    input.id = `metadata-${key}`; input.maxLength = 200; input.dataset.metadata = key;
    input.type = "text";
    label.append(span, input); fields.append(label);
  }
  const analysisSection = document.createElement("details");
  analysisSection.className = "settings-group";
  analysisSection.innerHTML = `<summary>Analysis Overlays</summary>
    <label class="field"><span>Analysis source</span><select id="analysisSourceInput"><option value="recorded">Analysis saved in SGF</option><option value="enclosed">Enclosed-area estimate</option><option value="katago">KataGo (local)</option></select></label>
    <label class="field field-inline"><input id="showGraphInput" type="checkbox"><span>Show win-rate graph</span></label>
    <label class="field field-inline"><input id="showTerritoryInput" type="checkbox"><span>Show territory / ownership</span></label>
    <label class="field field-inline"><input id="showDeadInput" type="checkbox"><span>Mark predicted dead stones</span></label>
    <p class="small">Territory colors: blue for Black, orange for White.</p>
    <p id="analysisNote" class="small">Recorded analysis is shown only where your SGF contains it.</p>
    <div id="katagoControls" hidden><p class="small">Download the KataGo network and runtime (about 13 MB) once, then analyze on this device. Game positions stay in your browser.</p>
      <button id="loadEngineButton" type="button" class="secondary-button">Download & load KataGo</button>
      <progress id="engineProgress" max="1" value="0" hidden aria-label="KataGo progress"></progress>
      <p id="engineStatus" class="small" role="status">KataGo has not been loaded.</p>
      <div class="field-grid"><button id="analyzePositionButton" type="button" class="secondary-button" disabled>Analyze preview</button><button id="analyzeRangeButton" type="button" class="secondary-button" disabled>Analyze clip / game</button></div>
      <button id="cancelAnalysisButton" type="button" class="secondary-button" disabled>Cancel analysis</button>
      <label class="field field-inline"><input id="analyzeExportInput" type="checkbox" checked><span>Analyze missing positions before export</span></label></div>`;
  const panel = document.querySelector(".panel-right");
  panel.insertBefore(exportSection, panel.querySelector(".settings-group"));
  panel.append(metadataSection, analysisSection);
  const ids = ["positionInput", "clipEnabledInput", "clipFields", "clipStartInput", "clipEndInput", "clipNote", "introInput", "outroInput", "preserveTailInput", "metadataFields", "analysisSourceInput", "showGraphInput", "showTerritoryInput", "showDeadInput", "analysisNote", "katagoControls", "loadEngineButton", "engineProgress", "engineStatus", "analyzePositionButton", "analyzeRangeButton", "cancelAnalysisButton", "analyzeExportInput", "sampleButton", "sgfTextInput", "loadTextButton"];
  const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  let game = null, originals = {}, cursor = 0, busy = false, graphTouched = false;
  const gameKey = () => `sgf2mv-game-settings-v1-${game.seed}-${game.raw.length}`;
  const clipInputs = [elements.clipEnabledInput, elements.clipStartInput, elements.clipEndInput];
  const saveGame = () => {
    if (!game) return;
    writeStoredSettings(gameKey(), {
      metadata: Object.fromEntries(Object.keys(metadataFields).map(key => [key, game[key]])),
      clip: Object.fromEntries(clipInputs.map(input => [input.id, controlValue(input)])),
    });
  };
  const updateClip = () => {
    elements.clipFields.disabled = busy || !game?.moves.length || !elements.clipEnabledInput.checked;
    try { const { start, end } = readRange(); elements.clipNote.textContent = elements.clipEnabledInput.checked ? `Export moves ${start + 1}–${end}, including both endpoints.` : "The full game will be exported."; }
    catch (error) { elements.clipNote.textContent = error.message; }
  };
  function readRange() {
    const total = game?.moves.length || 0;
    if (!elements.clipEnabledInput.checked || !total) return { start: 0, end: total };
    const first = Number(elements.clipStartInput.value), last = Number(elements.clipEndInput.value);
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > total || first > last) throw new Error(`Choose a first and last move between 1 and ${total}, in order.`);
    return { start: first - 1, end: last };
  }
  const syncMetadata = () => {
    for (const key of Object.keys(metadataFields)) document.getElementById(`metadata-${key}`).value = game?.[key] || "";
  };
  loader.querySelector("#sampleButton").addEventListener("click", () => callbacks.onText(sampleSgf, "handicap-example.sgf"));
  loader.querySelector("#loadTextButton").addEventListener("click", () => callbacks.onText(elements.sgfTextInput.value, "pasted-game.sgf"));
  elements.positionInput.addEventListener("input", () => callbacks.onSeek(Number(elements.positionInput.value)));
  for (const input of clipInputs) input.addEventListener("input", () => { updateClip(); saveGame(); });
  document.getElementById("clipStartHereButton").addEventListener("click", () => { elements.clipStartInput.value = Math.min(game.moves.length, cursor + 1); updateClip(); saveGame(); });
  document.getElementById("clipEndHereButton").addEventListener("click", () => { elements.clipEndInput.value = Math.max(1, cursor); updateClip(); saveGame(); });
  metadataSection.addEventListener("input", (event) => {
    const key = event.target.dataset.metadata;
    if (game && key && Object.hasOwn(metadataFields, key)) { game[key] = event.target.value; callbacks.onMetadata(key); saveGame(); }
  });
  document.getElementById("restoreMetadataButton").addEventListener("click", () => { if (game) { Object.assign(game, originals); syncMetadata(); callbacks.onMetadata(); saveGame(); } });
  const updateAnalysis = (event) => {
    if (event?.target === elements.showGraphInput) graphTouched = true;
    const source = elements.analysisSourceInput.value;
    elements.katagoControls.hidden = source !== "katago";
    elements.showDeadInput.disabled = source === "enclosed";
    if (source === "enclosed") elements.showDeadInput.checked = false;
    elements.analysisNote.textContent = source === "enclosed" ? "A simple enclosed-area estimate, not a life-and-death or score judgment." : source === "katago" ? "Local neural-network estimates. Dead-stone marks use strong predicted opponent ownership; review them before sharing." : "Uses Sabaki SBKV win rates and TB/TW territory marks saved in your SGF. Missing values are left blank.";
    callbacks.onAnalysisChange();
  };
  for (const input of [elements.analysisSourceInput, elements.showGraphInput, elements.showTerritoryInput, elements.showDeadInput]) input.addEventListener("change", updateAnalysis);
  elements.loadEngineButton.addEventListener("click", () => callbacks.onLoadEngine());
  elements.analyzePositionButton.addEventListener("click", () => callbacks.onAnalyze(false));
  elements.analyzeRangeButton.addEventListener("click", () => callbacks.onAnalyze(true));
  elements.cancelAnalysisButton.addEventListener("click", () => callbacks.onCancelAnalysis());
  const drop = document.querySelector(".panel-left");
  for (const event of ["dragenter", "dragover"]) drop.addEventListener(event, (e) => { if (e.dataTransfer?.types.includes("Files")) { e.preventDefault(); if (!busy) drop.classList.add("dragging"); } });
  drop.addEventListener("dragleave", (e) => { if (!drop.contains(e.relatedTarget)) drop.classList.remove("dragging"); });
  drop.addEventListener("drop", (e) => { if (!e.dataTransfer?.files.length) return; e.preventDefault(); drop.classList.remove("dragging"); if (!busy) callbacks.onFile(e.dataTransfer.files[0]); });
  document.addEventListener("keydown", (event) => {
    if (!game || busy || event.ctrlKey || event.metaKey || event.altKey || event.target.closest("input, textarea, select, button, summary")) return;
    const target = { ArrowLeft: cursor - (event.shiftKey ? 10 : 1), ArrowRight: cursor + (event.shiftKey ? 10 : 1), Home: 0, End: game.moves.length }[event.key];
    if (target !== undefined) { event.preventDefault(); callbacks.onSeek(target); }
  });
  return {
    elements, readRange,
    refreshAnalysis(savedGraph = false) { if (savedGraph) graphTouched = true; updateAnalysis(); },
    readTiming() {
      const read = (input) => { const value = Number(input.value); if (input.value === "" || !Number.isFinite(value) || value < 0 || value > 30) throw new Error("Opening and ending holds must be between 0 and 30 seconds."); return value; };
      return { intro: read(elements.introInput), outro: read(elements.outroInput), preserveTail: elements.preserveTailInput.checked };
    },
    setGame(next) {
      game = next; originals = Object.fromEntries(Object.keys(metadataFields).map((key) => [key, game[key] || ""]));
      elements.positionInput.max = game.moves.length;
      elements.clipStartInput.max = elements.clipEndInput.max = game.moves.length;
      elements.clipStartInput.value = 1; elements.clipEndInput.value = game.moves.length || 1;
      elements.clipEnabledInput.checked = false;
      const saved = readStoredSettings(gameKey());
      for (const key of Object.keys(metadataFields)) {
        if (typeof saved.metadata?.[key] === "string") game[key] = saved.metadata[key].slice(0, 200);
      }
      for (const input of clipInputs) restoreControl(input, saved.clip?.[input.id]);
      syncMetadata(); this.setPosition(0); this.setBusy(false);
      if (!graphTouched) elements.showGraphInput.checked = game.analysis.some((entry) => entry?.winrate !== null && entry?.winrate !== undefined);
    },
    setPosition(position) {
      cursor = Math.max(0, Math.min(game?.moves.length || 0, Math.round(Number(position) || 0)));
      elements.positionInput.value = cursor;
      elements.positionInput.setAttribute("aria-valuetext", `Move ${cursor} of ${game?.moves.length || 0}`);
    },
    get position() { return cursor; },
    setBusy(value) {
      busy = value;
      for (const input of [elements.sampleButton, elements.sgfTextInput, elements.loadTextButton, elements.introInput, elements.outroInput, elements.preserveTailInput]) input.disabled = busy;
      elements.positionInput.disabled = busy || !game;
      elements.clipEnabledInput.disabled = busy || !game?.moves.length;
      elements.metadataFields.disabled = busy || !game;
      updateClip(); this.setPosition(cursor);
    },
  };
}
