# Tic-Tac-Toe Wireframes

These Pencil wireframes turn the research brief into a light-first “annotated game sheet” interface for clever, mostly technical players. The design favors editorial clarity, terse game metadata, and restrained wit over neon, casino, childish, or dashboard styling.

## Screens

- [Single-player — Hard](single-player-hard.png): dominant board, Easy/Hard control, current-session score, strategy note, and round controls.
- [Online lobby](online-lobby.png): display name, create/join room-code paths, and a concise explanation of the WebSocket connection model.
- [Online match](online-match.png): named opponent, server-confirmed board state, room score, latency/connection status, rematch, and leave controls.
- [Mobile single-player](mobile-single-player.png): the same hierarchy condensed to a 390-by-844 viewport.
- [Combined PDF](tic-tac-toe-wireframes.pdf): review-ready export of all four frames.

## Interaction notes

- The board remains the primary visual and interaction target.
- Native buttons should back every cell, with visible focus and useful row/column labels.
- Difficulty is explicit; changing it affects the next computer decision.
- Online moves render only after the server confirms them.
- Connection state uses text in addition to color and should not generate noisy live-region updates.
- Scoreboard values are session-only unless persistence is deliberately added later.

## Visual system

- Warm paper background and near-white game surfaces
- Dark olive ink rather than pure black
- Restrained persimmon accent for actions and `X`
- Muted green for healthy connection/status signals and `O`
- Editorial display type for the title, clean sans-serif controls, and monospace metadata
- Tight 4/8/12/16/24/32/48 spacing rhythm with modest radii

The editable source is [game-wireframe.pen](../game-wireframe.pen); the PNG and PDF files are implementation and review exports.
