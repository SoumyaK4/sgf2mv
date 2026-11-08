# Third-party components

## Local KataGo analysis

The local worker uses the neural-network parser, TensorFlow.js model implementation,
Go feature extraction, and value postprocessing from [Web KaTrain](https://github.com/Sir-Teo/web-katrain),
pinned to commit `a6a67d645048a996d606a410c4e4c4b1051ffd43`.
The modules and MIT license are in `vendor/web-katrain/`.
Our worker, download/cache controller, and UI are implemented in this repository.

The pinned network is KataGo's `g170e-b10c128-s1141046784-d204142634.bin.gz`,
model version 8, distributed with [KataGo v1.15.3](https://github.com/lightvector/KataGo/tree/v1.15.3).
The upstream KataGo license is included as `vendor/KataGo-LICENSE`.
The bundled gzip has SHA-256:

```text
1a8e05a4ea3fca20dab79410cbb566c760767fcdd2fa0b701cfe259a84cc8b04
```

The worker bundles TensorFlow.js 4.22.0 and its WebGPU/WASM backends under
Apache-2.0. The full license is in `vendor/tensorflow-LICENSE`; retained bundled
notices are in `assets/katago/worker.js.LEGAL.txt`.

Only the analysis controls load these assets. Positions and SGF contents are
never sent to an analysis service. The inference path performs local neural
network evaluation, not a full KataGo tree search; ownership, win rate and
dead-stone marks are estimates.

## Existing audiovisual assets

Instrument samples are credited to [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments)
and [Philharmonia samples](https://github.com/skratchdot/philharmonia-samples/).
The site logo is credited to [Stoned On The Goban](https://www.instagram.com/p/CCa0rYCn1W1/).
