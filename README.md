# SGF to Music Video

A local browser app that turns a Baduk/Weiqi/Go SGF file into a square music video. The app animates the game on an elegant wooden goban and plays musical notes from the samples as each move appears.

Everything runs in the browser. SGF parsing, board animation, audio generation, and video recording are all local.

## Features

- Upload, drop, or paste an `.sgf` file, or try the built-in handicap example.
- Parse board size, players, komi, and move sequence.
- Play the first game's main line without treating comments or variations as moves.
- Support handicap and other setup positions (`AB`, `AW`, `AE`), including compressed point ranges and setup edits between moves. Setup stones do not count as moves.
- Animate stones on a realistic wooden goban.
- Use the photo board and stone textures from `assets/board-and-stones/`.
- Apply basic capture logic while the game plays.
- Generate deterministic music from the SGF, so the same file always creates the same melody.
- Use local instrument samples from `assets/music-notes/`.
- Render a downloadable `.webm` video with synchronized audio.
- Choose video size, move pace, volume, music mapping, register, note length, and board texture style.
- Customize the photo board or theme colors with Postcards palettes, stone styles, coordinates, grid and star points, surviving move numbers, rotation, zoom, framing, and text controls. Visual settings are remembered locally and update the current position during playback.
- Seek to any move with the preview slider or arrow/Home/End keys.
- Export an inclusive move range with the correct starting position, original move numbers, and musical context.
- Edit video metadata without changing the SGF or its musical seed.
- Configure opening/ending holds and optionally preserve the complete audio tail.
- Show recorded win-rate/territory annotations or opt into on-device KataGo ownership, dead-stone estimates, and generated win-rate graphs.
- Stop playback, recording, or analysis while it is running.
- Show SGF date (`DT`) and player ranks (`BR`/`WR`) on the board when those tags are present.

## Run locally

No install is required. Serve the folder with a tiny static server:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

Serving over `localhost` is recommended because browsers can block local sample loading from `file://`.

## Browser notes

Video export uses `MediaRecorder`, `canvas.captureStream`, and the Web Audio API. Chrome, Edge, and other Chromium-based browsers are recommended. The exported file is `.webm`.

## Preview and clip export

Load a game from a file, a drop on the left panel, pasted SGF text, or **Try an example**.
The preview slider shows positions after the selected move; move 0
includes setup/handicap stones. Arrow keys step through the game, Shift+Arrow
jumps ten moves, and Home/End select the initial/final position when a form control
is not focused. **Play** continues from the preview; **Stop** keeps that position.

In **Clip & Timing**, enable a move range and enter the first and last move,
both inclusive. For moves 40–100, the opening position contains moves 1–39 and
all preceding setup edits. Music also silently reconstructs the earlier phrasing,
melody, and tactical context. **Render video** always uses the configured range,
regardless of the preview cursor. The complex mode's musical move ranges remain
independent of this export range.

Complex mode's musical move ranges and sustained layers support **Duplicate**
and **Remove**. Copies retain instruments and all row settings. Bounds are
inclusive; a blank To extends to the end of the game. Overlapping musical ranges
use the first matching row. Invalid bounds, move pace, and layer repetition
intervals are reported before playback or recording starts.

Opening and ending holds accept 0–30 seconds. **Let final notes finish fading**
can extend the ending hold to avoid cutting off audio. For exports, selected
samples and any requested analysis are prepared before recording starts, and
settings are locked until it finishes. Preview music and visuals can still be
adjusted during playback.

**Game Details** edits title, event, players/ranks, date, komi, rules, and recorded
result. Restore the original values with
**Restore SGF details**. Text is rendered as plain text; source SGF and musical
seed stay unchanged. The title and event appear vertically along the left side of
the board, with result, rules, and komi vertically on the right. Players and date
appear beneath the board. Text and the graph use a consistent clear gap from the
board. SGF comments are not rendered. In the visual Text controls, **Show game title and event** is
independent of **Show result, rules and komi**. These controls separately
hide the title on the left and the details on the right.

Playback, music, analysis, and export preferences are saved in browser storage.
Common controls carry between Simple and Complex; mode-specific music settings,
board regions, move ranges, sustained layers, and expanded sections return on a
revisit. Metadata edits and clip bounds return when the same SGF is loaded again.
The desktop preview uses the available window height, with side panels scrolling
independently. Browser zoom and window size adjust the preview, not the export.

## Optional analysis

In Simple mode, Speed is a target interval: phrasing, note density, and slow
instrument attacks gently adjust spacing. Ordinary intervals stay within 16%
faster to 20% slower than that target, with gradual compensation to keep the
overall pace close. Note attacks are grouped and overlapping tails are bounded
to avoid crowding the next move.

Completed KataGo estimates also shape Simple-mode music, even if their visual
overlays are hidden. Consecutive win-rate and score drops are measured from the
player who moved: larger losses add a subdued descending cue and darker tone.
A loss of more than 45 percentage points adds a 100 ms quiet break after the cue,
including a fade of reverb and delay. These cues follow the tactical-accent
setting; missing evaluations and setup edits produce no inferred blunder cues.
They describe neural evaluation swings, rather than a best-move search.

When enabled and at least one win-rate value is available, a slim graph matching
the board's width appears above the board, with the move counter in its
header. Without graph data, only the move counter appears above the board.
The preview and exported video use the same compact square layout.

**Analysis Overlays** offers three sources:

- **Analysis saved in SGF** reads Sabaki `SBKV` as Black's win percentage and
  `TB`/`TW` territory marks, including compressed ranges. Missing win rates stay
  blank; the graph does not invent or interpolate them.
- **Enclosed-area estimate** is a lightweight empty-region estimate. It does not
  determine life and death or claim a final score.
- **KataGo (local)** loads the bundled runtime and a pinned b10c128 model only
  after **Download & load KataGo** is pressed (about 13 MB on the first load).
  It uses WebGPU when available and falls back to single-threaded WASM, without
  requiring special server headers. Game positions are never uploaded.
  Model integrity is checked with SHA-256, including on plain HTTP LAN addresses
  where the browser's Web Crypto API is unavailable.

KataGo supports square boards from 2 to 19. Its default komi, when absent in the
SGF, is 6.5 for Japanese/Korean, 7 for New Zealand, and 7.5 for other supported
rules. Set an explicit komi and rules in Game Details when needed. Unknown
rules are reported instead of silently reinterpreted.

Analyze the preview or the selected clip/full game. **Analyze missing positions
before export** automatically prepares the requested graph and ownership data
before recording. Analysis progress is cancellable; completed positions remain
available for the current session. Editing komi or rules invalidates those
position results. Other metadata edits preserve them.

After loading KataGo, **Play** finishes missing analysis from the preview position
through the end of the selected clip or game before starting playback when a
KataGo graph, territory, or dead-stone overlay is enabled. Cached positions are
reused, so subsequent playback can start immediately. **Stop** cancels preparation
without starting playback and retains completed estimates. Selecting KataGo alone
does not download the model; use **Download & load KataGo** first.
Simple mode includes the preceding positions when preparing analysis so that
clip exports and resumed playback reconstruct the same musical timing and cues.

Ownership strength controls overlay opacity: blue denotes Black and orange
White. Dead-stone marks use groups with strong predicted opponent ownership;
they mark stones without removing them. These are local neural-network
estimates rather than a full KataGo tree search or an authoritative score.

The verified model and runtime are cached separately from app updates and work
offline after loading, while the browser retains its cache. Position analysis
is held in memory for the current game. Larger boards can still use recorded
SGF analysis.

## Visual Mapping

The board uses `assets/board-and-stones/baduktv-board.png` by default. Stone textures are chosen deterministically from the matching black or white texture options, using the SGF seed and intersection. That gives the board natural variation while keeping the same SGF visually repeatable.

The default frame margin is 4%. Move counts and musical notes sit above the board,
with player names and the date below it. The title and event appear on the left,
and result, rules, and komi on the right. A consistent gap separates the board
from surrounding text, including at zero frame margin.

The SGF reader supports square Go boards from 2 to 52 intersections, escaped property text, and both empty and legacy `tt` passes (on boards up to 19). For SGF collections and variations, it plays the first game's first branch. Handicap stones come from the SGF's setup properties; `HA` alone does not specify their positions.

## SGF Postcards

[SGF-Postcards.html](SGF-Postcards.html) is a standalone, offline postcard editor for full-board and tilted images.

## Rebuilding the optional engine

The worker and WASM files are already built and checked in; running the static
site requires no install. To change the worker or update its pinned dependencies:

```bash
npm ci
npm run build:katago
```

The worker entry point is `scripts/katago-worker.ts`. Narrowly scoped upstream
source modules and licenses are preserved in `vendor/`; build dependencies are
pinned in `package-lock.json`. Bump the KataGo runtime cache version in `sw.js`
when changing the generated engine assets. The model is pinned and verified by
SHA-256 in `src/katago.js`.

## Credits

Local analysis uses [Web KaTrain](https://github.com/Sir-Teo/web-katrain),
[KataGo](https://github.com/lightvector/KataGo), and
[TensorFlow.js](https://github.com/tensorflow/tfjs). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for versions, provenance, and licenses.

Sounds are from:
- https://github.com/nbrosowsky/tonejs-instruments
- https://github.com/skratchdot/philharmonia-samples/

Logo image by <a href="https://www.instagram.com/p/CCa0rYCn1W1/">Stoned On The Goban</a>
