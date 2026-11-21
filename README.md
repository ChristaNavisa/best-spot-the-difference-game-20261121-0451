[![Make the best spot the difference game](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ChristaNavisa/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/ChristaNavisa/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

# Three Little Worlds — Spot the Difference

A complete, original spot-the-difference game that runs offline in a desktop
browser from static files. Two near-identical pictures side by side, click
the differences, beat the clock.

## How to play

- Open `game/index.html` (or serve `game/` with any static server) and play
  with mouse and keyboard — no network, no build step.
- Click a difference on **either** picture: it gets circled on both.
- A wrong click costs 3 seconds. A streak of finds builds a combo bonus.
- Press **H** for a hint (3 per level), **R** to restart the level,
  **1 / 2 / 3** to switch levels, **M** to mute, **Esc** for the menu.

## The three worlds

1. **Morning Garden** — 7 differences, 2:30 on the clock.
2. **Harbor at Dusk** — 10 differences, 3:00 on the clock.
3. **Night Market** — 12 differences, 3:30 on the clock.

Every scene is drawn procedurally on canvas — one scene function paints both
panels, and each difference is a small side-dependent detail, so the two
pictures stay consistent and every difference is fair but hidden by design.

## Layout

- `game/index.html` — page and HUD
- `game/style.css` — warm paper UI
- `game/src/scenes.js` — the three procedural scenes and their differences
- `game/src/engine.js` — state, clicks, timer, hints, score
- `game/src/render.js` — panels, markers, HUD, overlay screens
- `game/src/audio.js` — tiny WebAudio sound effects, no audio files
- `game/src/main.js` — input wiring and bootstrap
- `main.ts` — the entry program: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with the kit's `buildDossier`
- `screenshots/` — real renders of the game running in a browser

## Entry

Built for the make.fun bounty
[Make the best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451).
