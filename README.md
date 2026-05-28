# SGF to Music Video

A local browser app that turns a Baduk/Weiqi/Go SGF file into a square music video. The app animates the game on an elegant wooden goban and plays musical notes from the samples as each move appears.

Everything runs in the browser. SGF parsing, board animation, audio generation, and video recording are all local.

## Features

- Upload an `.sgf` file.
- Parse board size, players, komi, and move sequence.
- Animate stones on a realistic wooden goban.
- Use the photo board and stone textures from `board-and-stones/`.
- Apply basic capture logic while the game plays.
- Generate deterministic music from the SGF, so the same file always creates the same melody.
- Use local piano note samples from `music-notes/`.
- Render a downloadable `.webm` video with synchronized audio.
- Choose video size, move pace, volume, music mapping, register, note length, and board texture style.
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

The board uses `board-and-stones/baduktv-board.png` by default. Stone textures are chosen deterministically from the matching black or white texture options, using the SGF seed and intersection. That gives the board natural variation while keeping the same SGF visually repeatable.

## Credits

Sounds are from:
- https://github.com/nbrosowsky/tonejs-instruments
- https://github.com/skratchdot/philharmonia-samples/

Logo image by <a href="https://www.instagram.com/p/CCa0rYCn1W1/">Stoned On The Goban</a>
