const storageKey = "sgf2mv-settings-v1";
const sharedIds = new Set(["paceInput", "volumeInput", "sizeInput", "introInput", "outroInput", "preserveTailInput", "analysisSourceInput", "showGraphInput", "showTerritoryInput", "showDeadInput", "analyzeExportInput"]);
const gameIds = new Set(["clipEnabledInput", "clipStartInput", "clipEndInput"]);

export function readStoredSettings(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function writeStoredSettings(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browser storage is optional. */ }
}

export function controlValue(input) {
  return input.type === "checkbox" ? input.checked : input.value;
}

export function restoreControl(input, value) {
  if (input.type === "checkbox") {
    if (typeof value !== "boolean") return false;
    input.checked = value;
  } else {
    if (typeof value !== "string") return false;
    if (input.tagName === "SELECT" && ![...input.options].some(option => option.value === value)) return false;
    if (["number", "range"].includes(input.type) && value !== "") {
      const number = Number(value);
      if (!Number.isFinite(number)) return false;
      if (input.min !== "" && number < Number(input.min) || input.max !== "" && number > Number(input.max)) return false;
    }
    input.value = input.maxLength > 0 ? value.slice(0, input.maxLength) : value;
  }
  return true;
}

const rowValues = row => [...row.querySelectorAll("input, select")].map(controlValue);
function restoreRow(row, values) {
  if (!Array.isArray(values)) return;
  [...row.querySelectorAll("input, select")].forEach((input, index) => restoreControl(input, values[index]));
}

export function createPreferences({ mode, addRangeRow, addSustainRow, onRestore }) {
  const inputs = [...document.querySelectorAll(".panel-right input[id], .panel-right select[id]")]
    .filter(input => !input.closest("#visualControls, #metadataFields") && !gameIds.has(input.id));
  const groups = [...document.querySelectorAll(".panel-right details")];
  const saved = readStoredSettings(storageKey);
  const own = saved.modes?.[mode] || {};
  const restored = new Set();
  for (const input of inputs) {
    const value = sharedIds.has(input.id) ? saved.shared?.[input.id] : own.controls?.[input.id];
    if (restoreControl(input, value)) restored.add(input.id);
  }
  for (const [selector, values, add] of [["#rangeList", own.ranges, addRangeRow], ["#sustainList", own.sustains, addSustainRow]]) {
    const list = document.querySelector(selector);
    if (!list || !Array.isArray(values)) continue;
    list.replaceChildren();
    for (const row of values) {
      if (!Array.isArray(row)) continue;
      add();
      restoreRow(list.lastElementChild, row);
    }
  }
  for (const row of document.querySelectorAll(".region-row")) restoreRow(row, own.regions?.[row.dataset.region]);
  groups.forEach((group, index) => { if (typeof own.groups?.[index] === "boolean") group.open = own.groups[index]; });
  onRestore(restored);
  const sharedSnapshot = new Map(inputs.filter(input => sharedIds.has(input.id)).map(input => [input.id, controlValue(input)]));

  const save = () => {
    const state = readStoredSettings(storageKey);
    const shared = { ...state.shared }, controls = {};
    for (const input of inputs) {
      const value = controlValue(input);
      if (sharedIds.has(input.id)) {
        if (value !== sharedSnapshot.get(input.id) || !Object.hasOwn(shared, input.id)) shared[input.id] = value;
        sharedSnapshot.set(input.id, value);
      } else controls[input.id] = value;
    }
    writeStoredSettings(storageKey, {
      ...state, shared,
      modes: { ...state.modes, [mode]: {
        controls,
        ranges: [...document.querySelectorAll("#rangeList .range-row")].map(rowValues),
        sustains: [...document.querySelectorAll("#sustainList .sustain-row")].map(rowValues),
        regions: Object.fromEntries([...document.querySelectorAll(".region-row")].map(row => [row.dataset.region, rowValues(row)])),
        groups: groups.map(group => group.open),
      } },
    });
  };
  for (const type of ["input", "change"]) document.addEventListener(type, event => { if (event.target.closest(".panel-right")) save(); });
  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button && (button.closest(".panel-right") || button.matches(".remove-range, .remove-sustain"))) save();
  });
  groups.forEach(group => group.addEventListener("toggle", save));
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
  return { save };
}
