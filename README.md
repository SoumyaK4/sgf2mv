# SGF to Music Video

A local browser app that turns a Baduk/Weiqi/Go SGF file into a square music video. The app animates the game on an elegant wooden goban and plays musical notes from the samples as each move appears.

Everything runs in the browser. SGF parsing, board animation, audio generation, and video recording are all local.

## Features

- Upload an `.sgf` file.
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
- Stop playback or rendering while it is running.
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

## Visual Mapping

The board uses `assets/board-and-stones/baduktv-board.png` by default. Stone textures are chosen deterministically from the matching black or white texture options, using the SGF seed and intersection. That gives the board natural variation while keeping the same SGF visually repeatable.

The default frame margin is 4%. Move counts and musical notes sit above the board, with player names and the date below it, in the surrounding margin. A zero margin places these captions inside the frame.

The SGF reader supports square Go boards from 2 to 52 intersections, escaped property text, and both empty and legacy `tt` passes (on boards up to 19). For SGF collections and variations, it plays the first game's first branch. Handicap stones come from the SGF's setup properties; `HA` alone does not specify their positions.

## SGF Postcards

[SGF-Postcards.html](SGF-Postcards.html) is a standalone, offline postcard editor for full-board and tilted images.

## Credits

Sounds are from:
- https://github.com/nbrosowsky/tonejs-instruments
- https://github.com/skratchdot/philharmonia-samples/

Logo image by <a href="https://www.instagram.com/p/CCa0rYCn1W1/">Stoned On The Goban</a>
