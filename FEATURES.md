# Oh! Tic-Tac-Toe Features

Oh! Tic-Tac-Toe is a polished single-player game built with Nuxt 4, Nuxt UI, and Tailwind CSS. The current release prioritizes a complete local game, accessibility, and reliable automated coverage over an unfinished multiplayer prototype.

## Current features

### Single-player gameplay

- Play a complete game of tic-tac-toe against the computer.
- Choose Easy or Hard difficulty. Hard mode is selected by default.
- Easy mode takes an immediate winning move when one exists and otherwise chooses a random legal move.
- Hard mode uses deterministic minimax and does not lose when it plays optimally.
- Choose X or O. X always opens the round, so the computer moves first when the player chooses O.
- Start a new round at any time without allowing a delayed computer move from the previous round.
- Queue difficulty changes for the next round so the opponent's behavior does not change midway through a game.
- See clear turn, win, loss, and draw messages throughout the round.
- See the winning three-cell line highlighted when a player wins.

### Session scoreboard

- Track player wins, computer wins, and draws.
- Preserve totals when starting a new round.
- Reset all totals with an explicit action.
- Display singular and plural score labels correctly for assistive technology.

### Interface and accessibility

- Use responsive layouts designed for mobile and desktop screens.
- Switch between light and dark color modes.
- Play with a mouse, touch input, or keyboard.
- Navigate the board with Tab, the arrow keys, Home, and End.
- Place a mark with Enter or Space.
- Follow the active board position through a roving keyboard focus target.
- Hear turn and result changes through a polite live region.
- Use an ARIA grid with descriptive row, column, and cell-state labels.
- See visible focus indicators and game states that do not depend on color alone.
- Respect the operating system's reduced-motion preference.

### Quality and project documentation

- Test the rules engine and both computer strategies with Vitest.
- Test the rendered game, scorekeeping, mark selection, color mode, keyboard behavior, and accessibility with Nuxt Test Utils.
- Type-check, lint, test, and build the application through documented pnpm commands.
- Include product principles, implementation research, a step-by-step plan, Pencil wireframes, and exported design references.
- Run without environment variables, external APIs, or an AI service key. The minimax opponent runs locally.

## Current limitations

- The game supports one local player against the computer only.
- Scores live in memory and reset when the page reloads.
- The game does not save match history, preferences, or statistics.
- The board size and three-in-a-row win condition are fixed.
- The game does not provide undo, hints, sound effects, or adjustable computer timing.
- Easy mode is intentionally simple rather than strategically calibrated across several difficulty levels.
- The project does not include accounts, authentication, profiles, matchmaking, public rooms, spectators, or chat.
- Production hosting and deployment configuration are not part of this release.

## Deferred because of the two-hour timebox

The original plan treated real-time multiplayer as a stretch goal behind a strict quality gate. The available time went to completing the single-player loop, adding the session scoreboard, fixing interaction issues, improving the interface, expanding accessibility coverage, and performing a final code review.

The following multiplayer work was therefore dropped from this release:

- A mode switcher for single-player and online play.
- Display names and short room codes for creating or joining a match.
- A two-player online lobby and match interface.
- Nitro/H3 WebSocket configuration and event handling.
- A server-authoritative room registry for marks, turns, moves, results, and revisions.
- Validation for malformed, stale, out-of-turn, and terminal-state move requests.
- Connecting, connected, error, and opponent-disconnected states.
- Server-confirmed board updates shared between two browser tabs.
- Online rematch agreement and leave-room actions.
- Player-versus-player room scores.
- Unit tests for room lifecycle and protocol behavior.
- A two-tab end-to-end multiplayer smoke test.

Persistence, robust reconnection, cross-instance synchronization, database-backed rooms, matchmaking, spectators, chat, and authentication were explicitly outside the original two-hour plan rather than features cut during implementation.

## Scope changes from the original plan

- The session scoreboard shipped through the plan's fallback path after the multiplayer gate was not entered.
- Mark selection shipped even though the original plan fixed the player as X.
- Dark mode shipped even though the original plan listed it as out of scope.
- Real-time WebSocket multiplayer remains the primary candidate for a future release.
