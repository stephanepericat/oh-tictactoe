# Tic-Tac-Toe Implementation Plan

Status: Ready for review  
Timebox: 2 hours  
Implementation order: single player → real-time multiplayer → session scoreboard

## 1. Delivery contract

The implementation will optimize for a small, correct, polished release rather than an unfinished collection of features.

### Required release

- Nuxt 4 application using Vue 3 Composition API and `<script setup lang="ts">`
- Nuxt UI for the application shell and conventional controls
- Tailwind CSS for layout, board styling, responsive behavior, and design tokens
- Single-player game where the human is `X` and moves first
- Hard difficulty selected by default
- Easy difficulty that takes an immediate win and otherwise chooses a random legal move
- Hard difficulty using deterministic minimax and never losing with optimal play
- Difficulty changes queued for the next round
- Mouse, touch, Tab, arrow-key, Enter, and Space operation
- WCAG 2.2 AA contrast, focus visibility, status announcements, and reduced-motion support
- Unit tests for the engine and both AI strategies
- Nuxt component tests for the critical interaction loop
- Passing test, lint, and typecheck commands
- Responsive agreement with the approved desktop and mobile Pencil wireframes

### Stretch priority 1: real-time multiplayer

- Create or join a room with a short room code
- Two named players
- Server-assigned `X` and `O`
- Server-authoritative board, turn, result, and revision
- WebSocket synchronization through Nitro/H3
- Visible connecting, connected, opponent-left, and error states
- Basic rematch agreement
- Two-tab smoke test

### Stretch priority 2: scoreboard

- Player, CPU, and draw totals for single-player
- Player, opponent, and draw totals for an online room if multiplayer is complete
- Explicit reset action
- Memory-only lifecycle; refreshing the page resets the score

### Explicitly out of scope

- Accounts, authentication, profiles, or persistent statistics
- Matchmaking, public room discovery, spectators, or chat
- Database-backed rooms
- Cross-instance WebSocket synchronization
- Robust reconnect/resume after a dropped socket
- Computer mark selection
- Dark mode
- Sound effects
- Production deployment during the two-hour implementation session

## 2. Locked product and technical decisions

| Decision | Implementation |
| --- | --- |
| Initial mark | Human is `X`; computer is `O`; `X` starts. |
| Default difficulty | Hard, matching the approved wireframe. |
| Difficulty change | Store as `nextDifficulty`; commit it only in `newRound()`. |
| Easy behavior | Take an immediate win; otherwise choose a random legal move. |
| Hard behavior | Deterministic minimax with center/corner/edge tie-breaking. |
| Game state | Local composable for single-player; canonical Nitro room state for online. |
| Score persistence | Current browser session or room only; no local storage or database. |
| Multiplayer entry | Create or join using a short room code and display name. |
| Multiplayer trust | Clients send intents; the server validates and broadcasts results. |
| Online rendering | Do not render an optimistic move before server confirmation. |
| Initial server model | One-process in-memory room registry. |
| Accessibility model | Complete ARIA grid interaction with roving focus and arrow keys. |
| Visual direction | Warm “annotated game sheet”; no gradients, glass effects, neon, or dashboard chrome. |

## 3. Planned file structure

Files marked “stretch” are created only after the single-player gate passes.

```text
app/
  app.config.ts
  app.vue
  assets/css/main.css
  components/
    AppLogo.vue
    game/
      GameBoard.vue
      GameCell.vue
      GameControls.vue
      GameScoreboard.vue          # stretch
      GameShell.vue
      GameStatus.vue
      ModeSwitcher.vue            # stretch
    online/
      ConnectionStatus.vue       # stretch
      OnlineLobby.vue            # stretch
      OnlineMatch.vue            # stretch
  composables/
    useOnlineGame.ts             # stretch
    useTicTacToe.ts
  pages/
    index.vue
server/
  routes/
    _ws.ts                       # stretch
  utils/
    room-registry.ts             # stretch
shared/
  types/
    tic-tac-toe-events.ts        # stretch
    tic-tac-toe.ts
  utils/
    tic-tac-toe-ai.ts
    tic-tac-toe.ts
test/
  nuxt/
    game.test.ts
  unit/
    room-registry.test.ts        # stretch
    tic-tac-toe-ai.test.ts
    tic-tac-toe.test.ts
vitest.config.ts
```

`app/pages/index.vue` will remain a thin composition surface. Pure rules and AI live in `shared/`, Vue state and side effects live in composables, and presentational components receive typed props and emit typed events.

## 4. Component map

| Component | Single responsibility | Main contract |
| --- | --- | --- |
| `GameShell.vue` | Instantiate the active game composable and arrange the page sections. | No public state mutation; passes props and handles emitted actions. |
| `ModeSwitcher.vue` | Stretch: expose online mode only after its vertical slice works. | `modelValue: 'single' \| 'online'`; emits a typed update. |
| `GameStatus.vue` | Render turn, thinking, result, or connection copy. | Read-only status and optional detail; contains the polite live region. |
| `GameBoard.vue` | Render the 3-by-3 grid and own keyboard focus movement. | Board/result props; emits `select(index)`. |
| `GameCell.vue` | Render one board position as an interactive native button. | Index, mark, disabled, winning, and tab-index props; emits `select` and `focus`. |
| `GameControls.vue` | Render difficulty and round actions. | Current/next difficulty props; emits difficulty and new-round actions. |
| `GameScoreboard.vue` | Render and optionally reset session totals. | Read-only scores; emits `reset`. |
| `OnlineLobby.vue` | Collect a display name and create/join room intent. | Emits validated `create` or `join` payloads. |
| `OnlineMatch.vue` | Compose server-confirmed board, players, result, and actions. | Receives public room state; emits move/rematch/leave intents. |
| `ConnectionStatus.vue` | Present the socket state without relying on color alone. | Connection state, optional latency, and concise label. |

No Pinia store, provide/inject layer, or global `useState` is planned. The feature does not need cross-route shared state.

## 5. Domain and state contracts

### Pure game model

`shared/types/tic-tac-toe.ts` will define:

- `Mark = 'X' | 'O'`
- `Cell = Mark | null`
- An immutable nine-position `Board` tuple
- `Difficulty = 'easy' | 'hard'`
- `GameResult` as `playing`, `draw`, or `won`
- `GamePhase` as `human-turn`, `computer-turn`, or `finished`

`shared/utils/tic-tac-toe.ts` will export:

- `WINNING_LINES`
- `createBoard()`
- `getLegalMoves(board)`
- `getGameResult(board)`
- `placeMark(board, index, mark)`

Every function will be framework-free, immutable, deterministic, and safe for use by both the browser and Nitro server.

### AI contract

`shared/utils/tic-tac-toe-ai.ts` will export:

- `chooseEasyMove(board, computerMark, random?)`
- `chooseHardMove(board, computerMark, humanMark)`

Easy receives an injectable random function for deterministic tests. Hard searches legal continuations with minimax and evaluates terminal positions with depth-sensitive scores.

Tie-breaking order:

```text
center → corners → edges
4 → 0, 2, 6, 8 → 1, 3, 5, 7
```

### Single-player composable

`useTicTacToe()` will own only source state:

- immutable board in a `shallowRef`
- current phase in a `shallowRef`
- round difficulty and next difficulty
- optional reactive score object
- a non-reactive computer-turn timer handle

It will derive result, winner, winning line, status copy, and playability with pure `computed` values. It will expose readonly state and the explicit actions:

- `playCell(index)`
- `setNextDifficulty(difficulty)`
- `newRound()`
- `resetScores()` if the scoreboard is reached

`newRound()` and scope disposal will cancel any pending computer timer.

## 6. Step-by-step implementation sequence

### Step 1 — Establish the test foundation

Target time: minute 0–8

Files:

- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.ts`
- `test/unit/`
- `test/nuxt/`

Actions:

1. Install `vitest`, `@nuxt/test-utils`, `@vue/test-utils`, and `happy-dom` as development dependencies.
2. Add `test`, `test:run`, `test:unit`, and `test:nuxt` scripts.
3. Configure two Vitest projects:
   - `unit`: Node environment and `test/unit/**`
   - `nuxt`: `defineVitestProject`, Nuxt environment, and `test/nuxt/**`
4. Add one temporary smoke assertion to each project.
5. Run both projects once and remove the temporary tests after configuration is proven.

Exit condition:

- Both projects are discovered independently and finish successfully.

Stop condition:

- If dependency or configuration problems consume more than eight minutes, keep only the Node project temporarily, implement the pure core, then return to Nuxt tests before UI completion.

### Step 2 — Implement the pure game engine test-first

Target time: minute 8–22

Files:

- `shared/types/tic-tac-toe.ts`
- `shared/utils/tic-tac-toe.ts`
- `test/unit/tic-tac-toe.test.ts`

Actions:

1. Define the immutable types and eight winning lines.
2. Write failing tests for:
   - nine empty starting cells
   - valid placement
   - occupied and out-of-range rejection
   - input immutability
   - all eight winning lines
   - correct winning mark and line
   - full-board draw
   - nonterminal board
   - post-game move rejection
3. Implement the smallest pure functions that pass those tests.
4. Run only the engine test file.

Exit condition:

- All rule tests pass without importing Vue, Nuxt, or browser APIs.

### Step 3 — Implement Easy and Hard AI test-first

Target time: minute 22–36

Files:

- `shared/utils/tic-tac-toe-ai.ts`
- `test/unit/tic-tac-toe-ai.test.ts`

Actions:

1. Write Easy tests for:
   - immediate winning move
   - deterministic legal selection with injected random values
   - finished/full board returning `null`
   - no board mutation
2. Implement Easy by checking immediate wins before random legal selection.
3. Write Hard tests for:
   - immediate win
   - immediate block
   - center preference on an empty board
   - deterministic tie-breaking
   - legal output only
   - finished/full board returning `null`
   - no board mutation
4. Implement minimax with depth-sensitive terminal scores.
5. If time remains in this step, recursively enumerate human continuations and assert that Hard cannot lose.

Exit condition:

- Both strategies satisfy their contracts and the full unit project remains green.

Cut rule:

- Alpha-beta pruning is omitted unless the straightforward minimax is already correct and readable.

### Step 4 — Implement the single-player state machine

Target time: minute 36–50

Files:

- `app/composables/useTicTacToe.ts`
- initially `test/nuxt/game.test.ts`

Actions:

1. Create the board, phase, round difficulty, and next-difficulty state.
2. Derive result, winning line, status message, and `canPlay`.
3. Implement the guarded human move.
4. Detect terminal state immediately after the human move.
5. Enter `computer-turn` and schedule a short 200–300 ms response.
6. Choose the Easy or Hard strategy from the locked round difficulty.
7. Apply one legal computer move and evaluate the result.
8. Return to `human-turn` only if play continues.
9. Queue difficulty changes for `newRound()`.
10. Cancel the timer on new round and scope disposal.
11. Return readonly state plus explicit actions.

Focused tests:

- second human input is ignored during the computer turn
- fake timers produce exactly one computer move
- reset during the delay prevents a stale computer move
- terminal rounds never schedule another move
- difficulty changes affect the following round

Exit condition:

- Repeated rounds can be driven through the composable without illegal transitions.

### Step 5 — Replace the starter shell and establish the visual system

Target time: minute 50–57

Files:

- `app/app.vue`
- `app/app.config.ts`
- `app/assets/css/main.css`
- `app/components/AppLogo.vue`
- remove `app/components/TemplateMenu.vue`

Actions:

1. Replace starter metadata and external links with game-specific title and description.
2. Preserve `UApp`, `UHeader`, and `UMain`; remove starter footer and template controls.
3. Define the wireframe tokens:
   - warm paper background
   - near-white surface
   - dark olive ink
   - muted secondary text
   - persimmon action/`X`
   - green status/`O`
4. Configure Nuxt UI semantic colors and focused component defaults in `app.config.ts`.
5. Use system serif, sans-serif, and monospace stacks initially; do not add font dependencies during the timebox.
6. Keep transitions to color/opacity and honor `prefers-reduced-motion`.

Exit condition:

- The empty application shell already resembles the Pencil direction at desktop and mobile widths.

### Step 6 — Build the playable interface

Target time: minute 57–70

Files:

- `app/pages/index.vue`
- `app/components/game/GameShell.vue`
- `app/components/game/GameStatus.vue`
- `app/components/game/GameBoard.vue`
- `app/components/game/GameCell.vue`
- `app/components/game/GameControls.vue`

Actions:

1. Keep `index.vue` limited to metadata and `GameShell`.
2. Arrange the desktop two-column board/control composition.
3. Collapse to the approved single-column mobile hierarchy at narrow widths.
4. Render all nine cells from stable indices.
5. Connect cells to the composable through typed `select(index)` events.
6. Render current turn, thinking, win, and draw copy in a polite live region.
7. Render the Easy/Hard control and “changes next round” cue.
8. Add the new-round action.
9. Highlight all three winning cells with text/shape/color-safe styling.
10. Add short, nonblocking strategy copy for Easy and Hard.

Exit condition:

- A complete single-player round works through rendered controls at desktop and mobile sizes.

### Step 7 — Complete keyboard and component behavior

Target time: minute 70–78

Files:

- `GameBoard.vue`
- `GameCell.vue`
- `test/nuxt/game.test.ts`

Actions:

1. Implement a complete 3-by-3 ARIA grid:
   - one cell in the tab order
   - Left/Right/Up/Down movement
   - row and column boundaries
   - Enter/Space activation through native buttons
   - focus retained on a sensible cell after moves
2. Give each cell an accessible name such as “Row 2, column 3, empty.”
3. Mark occupied/unavailable cells without relying on color.
4. Add visible `focus-visible` styling.
5. Test rendered behavior rather than private component state:
   - nine named cells
   - arrow navigation
   - human and computer marks
   - thinking lock
   - live status updates
   - winning-cell indication
   - new-round reset

Exit condition:

- Unit tests and critical Nuxt tests pass; keyboard play is complete and accurately described by the UI.

## 7. Minute-78 release gate

Run:

```bash
pnpm test:run
pnpm lint
pnpm typecheck
```

The gate passes only when:

- Easy and Hard both work
- the complete round loop is playable
- no known illegal state transition exists
- critical unit and Nuxt tests pass
- no blocking lint or TypeScript error exists
- desktop and mobile layouts are usable

### If the gate passes

Begin real-time multiplayer immediately. Do not implement the scoreboard first.

### If the gate fails

Do not start networking. Spend the remaining time fixing the core release. If the core becomes green with at least ten minutes remaining but fewer than roughly forty minutes remain, use the small remainder for the session scoreboard and final verification.

## 8. Real-time multiplayer stretch sequence

### Step 8 — Define the protocol and enable WebSockets

Target time: minute 78–84

Files:

- `nuxt.config.ts`
- `shared/types/tic-tac-toe-events.ts`

Actions:

1. Enable Nitro `experimental.websocket`.
2. Define discriminated client events:
   - `create_room`
   - `join_room`
   - `make_move`
   - `request_rematch`
   - `leave_room`
3. Define server events:
   - `room_state`
   - `move_rejected`
   - `peer_status`
   - `error`
4. Include a monotonically increasing room revision in state and move intents.
5. Limit display names, room codes, indices, and message size at the contract boundary.

Exit condition:

- Client and server compile against the same shared event types.

### Step 9 — Build and test the authoritative room registry

Target time: minute 84–95

Files:

- `server/utils/room-registry.ts`
- `test/unit/room-registry.test.ts`

Room state:

- normalized room code
- board
- active mark
- game result
- revision
- two player slots tied to server peer IDs
- rematch-ready flags

Actions:

1. Generate collision-checked short room codes.
2. Assign the creator `X` and the joiner `O`.
3. Reject a third player.
4. Validate membership, turn, revision, board index, cell availability, and terminal state for every move.
5. Apply the shared pure engine on the server.
6. Require both players to request a rematch before resetting.
7. Mark a disconnected opponent and remove empty rooms.

Tests:

- room creation and normalized joining
- mark assignment and capacity
- valid move/revision update
- out-of-turn, occupied, stale, and post-game rejection
- rematch agreement
- disconnect cleanup

Exit condition:

- The server model is correct without needing a live socket.

### Step 10 — Add the WebSocket handler

Target time: minute 95–102

Files:

- `server/routes/_ws.ts`

Actions:

1. Export `defineWebSocketHandler`.
2. Parse messages defensively and reject malformed/unknown payloads.
3. Resolve player identity exclusively from the server peer.
4. Delegate all game decisions to the room registry.
5. Subscribe peers to room topics and broadcast public room state.
6. Handle close/error without throwing into the server process.
7. Never accept a client-supplied board, mark, result, or opponent identity.

Exit condition:

- Two raw WebSocket clients can create/join and receive the same canonical state.

### Step 11 — Build the lobby and online match client

Target time: minute 102–113

Files:

- `app/composables/useOnlineGame.ts`
- `app/components/online/ConnectionStatus.vue`
- `app/components/online/OnlineLobby.vue`
- `app/components/online/OnlineMatch.vue`
- `app/components/game/ModeSwitcher.vue`
- `GameShell.vue`

Actions:

1. Create the socket only in the browser and only on explicit online entry.
2. Add the mode switcher now that both destinations are functional; do not ship a dead Online control.
3. Normalize room-code input and validate display-name length.
4. Expose a small readonly state machine:
   - `idle`
   - `connecting`
   - `waiting`
   - `playing`
   - `finished`
   - `disconnected`
   - `error`
5. Render server-confirmed state only.
6. Disable the board when disconnected, waiting, out of turn, stale, or finished.
7. Show room code, player names/marks, connection status, and errors in text.
8. Implement rematch request and leave-room actions.
9. Reuse `GameBoard` and `GameStatus`; do not duplicate board markup.

Exit condition:

- Two tabs can create/join a room and play a synchronized complete round.

### Step 12 — Multiplayer smoke test and stabilization

Target time: minute 113–120

Actions:

1. Open two independent browser tabs.
2. Create and join one room.
3. Verify both mark assignments.
4. Attempt out-of-turn and duplicate moves.
5. Finish a win or draw and verify identical results.
6. Complete a rematch agreement.
7. Close one tab and verify the remaining board locks with an opponent-left message.
8. Run unit tests, Nuxt tests, lint, and typecheck again.

Exit condition:

- The room-code vertical slice works locally with no known divergent state.

If online play is not working by minute 113, stop adding UI polish. Preserve a green single-player release and report multiplayer as incomplete rather than weakening the core.

## 9. Scoreboard stretch sequence

The scoreboard is attempted only after online play is complete, or when the online gate was not entered and the single-player release is already green.

Files:

- `app/components/game/GameScoreboard.vue`
- `app/composables/useTicTacToe.ts`
- online room state and registry only if multiplayer is already complete

Actions:

1. Add scores only at the single transition from playing to a terminal result.
2. Prevent duplicate increments from repeated renders or actions.
3. Preserve scores across `newRound()`.
4. Clear scores only through `resetScores()`.
5. Keep values memory-only.
6. Add one focused test for each result and reset.

Cut rule:

- If fewer than five safe minutes remain, omit the scoreboard.

## 10. Final verification checklist

### Automated

- `pnpm test:run`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build` if the remaining time allows a production build

### Single-player manual

- Easy and Hard both complete a round
- Hard blocks an immediate threat
- occupied cells and input during CPU thinking are ignored
- difficulty switches on the next round
- new round during CPU delay causes no stale move
- win and draw copy are correct
- winning line is visible without color alone
- mouse, touch-sized controls, Tab, arrow keys, Enter, and Space work
- 390 px mobile and desktop layouts match the wireframe hierarchy
- reduced-motion preference removes nonessential transitions

### Online manual, if implemented

- create/join room works in two tabs
- both clients show the same revision and board
- only the active player can move
- malformed or stale intents do not change room state
- result and rematch stay synchronized
- disconnect state is visible and disables play

## 11. Risk register and containment

| Risk | Early signal | Containment |
| --- | --- | --- |
| Test setup incompatibility | Vitest cannot discover both environments by minute 8. | Keep pure tests in Node, use the current Nuxt `defineVitestProject` pattern, and defer noncritical rendered tests. |
| Minimax bug | Hard misses a tactical block or returns an occupied index. | Keep the engine pure, add tactical tests first, and add exhaustive non-loss enumeration if possible. |
| Stale CPU timer | A reset produces an unexpected `O`. | Centralize the timer and clear it in both `newRound()` and scope disposal. |
| Hydration mismatch | Initial client render differs from prerendered HTML. | Keep initial board/state deterministic and call random/browser APIs only after interaction. |
| Keyboard semantics drift | UI advertises arrows but only Tab works. | Ship the entire roving-grid behavior or remove the arrow-key claim. |
| WebSocket API instability | Handler/config differs from installed Nitro. | Use the installed Nitro 2.13.4 API and prove a minimal handler before building online UI. |
| Divergent online boards | Clients accept their own optimistic state. | Render only server-broadcast `room_state` with revisions. |
| Serverless room loss | Room disappears between requests/instances. | Limit the prototype to one server process and document the constraint. |
| Visual polish consumes core time | Layout work begins before rules/tests are green. | Follow the sequence and preserve the minute-78 gate. |

## 12. Review decisions

Approval of this plan confirms:

- Hard is the default difficulty.
- Difficulty changes take effect on the next round.
- Full arrow-key grid behavior is included in the required release.
- WebSocket multiplayer is attempted before the scoreboard.
- The online prototype is intentionally single-process and nonpersistent.
- A green single-player release takes precedence over partially working networking.

## 13. Planning references

Project references:

- [Implementation research](tic-tac-toe-implementation-research.md)
- [Product principles](../PRODUCT.md)
- [Editable Pencil wireframe](game-wireframe.pen)
- [Wireframe exports and interaction notes](wireframes/README.md)

Current framework references:

- [Nuxt 4 testing and Vitest projects](https://nuxt.com/docs/4.x/getting-started/testing)
- [Nuxt 4 server directory](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt UI component theming](https://ui.nuxt.com/docs/getting-started/theme/components)
- [Nitro WebSocket handlers](https://nitro.build/guide/websocket)
- [Vitest projects](https://vitest.dev/guide/projects)
- [Vue testing guidance](https://vuejs.org/guide/scaling-up/testing.html)
