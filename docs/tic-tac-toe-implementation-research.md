# Tic-Tac-Toe Implementation Research

Research date: 2026-07-25

## Executive recommendation

Build the first version as a client-side, single-page game with three deliberately separate layers:

1. A pure TypeScript game engine for board rules and result evaluation.
2. Two pure TypeScript opponents: an approachable Easy strategy and an unbeatable Hard minimax strategy.
3. A Vue composable that coordinates reactive state, turns, scores, and the computer's move.

Keep the route component thin and render the interface with a small group of focused Vue components. Use Nuxt UI for the page shell and ordinary controls, Tailwind CSS for the 3-by-3 board, and native buttons for the cells.

This approach fits the two-hour limit because the most error-prone logic can run in fast Node-based Vitest tests. Only the rendered game behavior needs the heavier Nuxt test environment. Once the full single-player loop is stable, prioritize the room-code WebSocket slice; add the small session scoreboard only after online play works or when there is not enough safe time to begin networking.

If the core is finished unusually early, the multiplayer stretch is a room-code WebSocket prototype. Treat that as a separate vertical slice with server-authoritative state, not as a mode branch inside the local composable. A production-ready online mode is unlikely within the same two-hour timebox because rooms, transport, reconnection, synchronization, deployment constraints, and error handling all need attention.

## Repository findings

The repository is already a working Nuxt UI starter. `package.json` currently declares:

- Nuxt `^4.4.8`
- Nuxt UI `^4.10.0`
- Tailwind CSS `^4.3.2`
- pnpm `11.13.1`

The required UI wiring is already present:

- `@nuxt/ui` is registered in `nuxt.config.ts`.
- `app/assets/css/main.css` imports both `tailwindcss` and `@nuxt/ui`.
- `app/app.vue` wraps the application in `UApp`.
- `app/app.config.ts` defines semantic Nuxt UI colors.
- The `/` route is prerendered, which is compatible with single-player. The static initial board becomes interactive after hydration.
- The lockfile resolves Nitro `2.13.4`. This version exposes experimental WebSocket support through H3/CrossWS, but it must be enabled explicitly and deployed to a WebSocket-capable server target.

Testing is not installed or configured yet. There are no Vitest scripts, `@nuxt/test-utils`, Vue Test Utils, DOM test environment, or test configuration.

## MVP product scope

### Required single-player experience

- The player is `X` and moves first.
- The computer is `O`.
- A visible Easy/Hard control changes the computer strategy without silently resetting the current round.
- Easy takes an immediate win when available and otherwise chooses a legal move randomly.
- Hard uses minimax and cannot be forced to lose.
- Nine interactive cells display the board.
- A move is rejected when the cell is occupied, the game is over, or the computer is thinking.
- The interface announces whose turn it is, the winner, or a draw.
- A winning line is visually highlighted.
- A **New round** control resets the board.
- The game works with mouse, touch, and keyboard.
- The layout remains usable on a narrow mobile viewport.

### Useful but optional polish

- A short 200–350 ms computer-turn delay so both moves do not appear in the same Vue render batch.
- A subtle computer-thinking state.
- Session scores for player wins, computer wins, and draws, plus a **Reset scores** action.
- A choice to play as `X` or `O`.
- Dark mode after the light-first interface is complete and contrast-checked.

The delay must be cancellable when a round resets or the component unmounts. If the deadline becomes tight, remove the delay and thinking state before cutting correctness or accessibility.

### Stretch multiplayer scope

Use a room-code flow:

1. One player enters a display name and creates a short room code.
2. The second player enters a name and joins that code.
3. The server assigns `X` and `O`, owns the canonical board, and broadcasts accepted state.
4. Clients send move intents; they never declare the resulting board or winner.
5. A dropped connection locks the board and shows a clear disconnected state. Robust resume/rejoin is outside the prototype.

Do not begin this slice until single-player Easy and Hard modes, critical tests, lint, and typecheck pass. The pure engine in `shared/` can be reused by the server without duplicating rules.

## Recommended architecture

Nuxt 4 uses `app/` for application code and supports framework-free utilities in `shared/`. Nuxt auto-imports top-level utilities and types from `shared/utils/` and `shared/types/`, while `app/composables/` is the conventional home for Vue composables.

```text
app/
  components/
    game/
      Board.vue
      Cell.vue
      Controls.vue
      Shell.vue
      Status.vue
    online/
      Lobby.vue              # stretch
      MatchStatus.vue        # stretch
  composables/
    useTicTacToe.ts
    useOnlineGame.ts         # stretch
  pages/
    index.vue
server/
  routes/
    _ws.ts                   # stretch WebSocket handler
  utils/
    room-registry.ts         # stretch, in-memory prototype
shared/
  types/
    tic-tac-toe.ts
    tic-tac-toe-events.ts    # stretch
  utils/
    tic-tac-toe.ts
    tic-tac-toe-ai.ts
test/
  nuxt/
    game.test.ts
  unit/
    tic-tac-toe.test.ts
    tic-tac-toe-ai.test.ts
vitest.config.ts
```

Nested component names receive their directory prefix in Nuxt. With the names above, the page can use `GameShell`, and the feature components can use `GameBoard`, `GameCell`, `GameControls`, and `GameStatus`.

### Component responsibilities

| File | Responsibility | Public contract |
| --- | --- | --- |
| `app/pages/index.vue` | Set page metadata and compose the game feature. | No game state. |
| `app/components/game/Shell.vue` | Own one `useTicTacToe()` instance and arrange status, board, score, and controls. | No props required for the MVP. |
| `app/components/game/Board.vue` | Render the nine cells and translate cell choices into one event. | Props: board, phase, winning line. Emit: `select(index)`. |
| `app/components/game/Cell.vue` | Render one square with its accessible name and visual state. | Props: index, mark, unavailable, winning. Emit: `select(index)`. |
| `app/components/game/Status.vue` | Present turn/result text and optional scores in a live region. | Read-only props. |
| `app/components/game/Controls.vue` | Render difficulty, new-round, and optional score-reset controls. | Emits explicit actions. |
| `app/composables/useTicTacToe.ts` | Coordinate local reactive state, difficulty, legal actions, CPU timing, and round scores. | Readonly state plus `playCell`, `newRound`, and `setDifficulty`. |
| `app/composables/useOnlineGame.ts` | Stretch: own the socket lifecycle and expose only server-confirmed room state. | `createRoom`, `joinRoom`, `playCell`, `requestRematch`, `leaveRoom`. |
| `server/utils/room-registry.ts` | Stretch: assign marks, validate intents with the shared engine, and clean up rooms. | Pure/testable room transitions around a small in-memory map. |

Use typed props and emits. Keep state mutations inside the composable and pass data down/events up through the component tree. Pinia, provide/inject, and global `useState` would add indirection without solving a current requirement.

## Domain model

Keep the engine independent of Vue, browser APIs, and Nuxt:

```ts
export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = readonly [
  Cell, Cell, Cell,
  Cell, Cell, Cell,
  Cell, Cell, Cell
]

export type GameResult =
  | { status: 'playing' }
  | { status: 'draw' }
  | { status: 'won', winner: Mark, line: readonly [number, number, number] }
```

The engine should expose small pure functions:

- `createBoard()`
- `getGameResult(board)`
- `getLegalMoves(board)`
- `placeMark(board, index, mark)`

`placeMark` should return a new board rather than mutate its input. Immutable replacement makes the composable predictable and allows the board to live in a `shallowRef`. Invalid moves should have one consistent contract—either return the original board/result or return `null`. Returning `null` is explicit and easy to test.

Store the eight winning lines once:

```ts
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
] as const
```

The result must be evaluated immediately after each move. A board with a winning line is finished even if empty cells remain.

## Computer opponent

### Easy

Keep Easy understandable and testable:

1. Take an immediate winning move when one exists.
2. Otherwise select from the legal moves with an injected random-number function.

This lets the computer occasionally miss a block, which makes the mode beatable, without making it ignore an obvious win. Pass the random function into `chooseEasyMove` so unit tests can be deterministic.

### Hard

Minimax is a good fit because tic-tac-toe has a tiny finite game tree. An exhaustive search is fast enough to run synchronously on every computer turn.

Use terminal scores that prefer faster wins and slower losses:

- Computer win: `10 - depth`
- Human win: `depth - 10`
- Draw: `0`

At computer nodes, maximize the score. At human nodes, minimize it. For deterministic choices, examine moves in this order:

```ts
[4, 0, 2, 6, 8, 1, 3, 5, 7]
```

That makes the computer prefer the center, then corners, then edges when multiple moves have the same minimax value. Alpha-beta pruning is safe but unnecessary for the MVP; add it only if it does not make the implementation harder to reason about.

`chooseBestMove(board, computerMark, humanMark)` must:

- Return only an empty cell.
- Return `null` for a finished board or a board with no legal moves.
- Take an immediate winning move.
- Block an immediate human win.
- Never mutate the supplied board.

Keep Hard deterministic so failures are reproducible and tests are stable.

## Reactive game flow

`useTicTacToe` should keep source state minimal:

- `board`: a `shallowRef<Board>` replaced after every move
- `phase`: `'human-turn' | 'computer-turn' | 'finished'`
- `difficulty`: `'easy' | 'hard'`
- `scores`: a small reactive object, if the scoreboard is included
- `computerTimer`: a non-reactive timeout handle

Derive the following with pure `computed` values:

- `result`
- `winner`
- `winningLine`
- `statusMessage`
- `canHumanPlay`

Recommended move sequence:

1. `playCell(index)` exits unless the phase is `human-turn`.
2. Attempt the human move with `placeMark`.
3. Replace `board` only when the move is valid.
4. Finish and score the round if the result is terminal.
5. Otherwise set the phase to `computer-turn`.
6. Schedule or immediately calculate the move with the selected difficulty strategy.
7. Apply the computer move and evaluate the result.
8. Return the phase to `human-turn` when the game continues.

`newRound()` must clear a pending timer before replacing the board. `onScopeDispose` should also clear it. This prevents an old computer move from being applied to a new round.

Do not call `Math.random()` or create time-dependent state during server rendering. The initial board and phase must be deterministic so prerendered HTML hydrates cleanly.

## Real-time multiplayer architecture

The installed Nitro `2.13.4` supports H3 WebSocket handlers behind its experimental flag:

```ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      websocket: true
    }
  }
})
```

The WebSocket route can export `defineWebSocketHandler` and use `open`, `message`, `close`, and `error` hooks. CrossWS peers can subscribe and publish to a topic derived from the normalized room code, but the room registry—not the client—must remain authoritative.

Use a small discriminated-union protocol:

```ts
type ClientEvent =
  | { type: 'join_room', roomCode: string, displayName: string }
  | { type: 'make_move', roomCode: string, index: number, revision: number }
  | { type: 'request_rematch', roomCode: string }

type ServerEvent =
  | { type: 'room_state', room: PublicRoomState }
  | { type: 'move_rejected', reason: string, revision: number }
  | { type: 'peer_status', status: 'joined' | 'left' }
  | { type: 'error', code: string, message: string }
```

For every move, the server validates the payload shape, membership, assigned mark, turn, board index, cell availability, game status, and client revision. It then applies `placeMark`, increments the revision, evaluates the result, and broadcasts the new public state.

For the prototype, an in-memory room map is acceptable with explicit limitations:

- rooms disappear on restart or redeploy
- the app must run as one process
- horizontal scaling requires shared room state and pub/sub
- static-only hosting cannot serve the WebSocket route
- deployment support must be verified on the chosen Nitro preset/provider

Cap display-name and room-code lengths, reject malformed JSON and unknown message types, and limit message size/rate even in a prototype. Do not implement optimistic moves: the board updates only from `room_state`, which avoids rollback complexity.

## UI and styling approach

The wireframe direction is an “annotated game sheet”: warm paper-like surfaces, an editorial headline, monospaced game metadata, precise rules, and restrained persimmon accents. It aims for the clarity of a daily puzzle without copying one, and avoids neon/cyberpunk, casino, childish, and generic dashboard styling. The audience is clever, mostly technical players, so terse strategy notes and connection metadata can add wit without blocking play.

Use Nuxt UI where it provides structure and standard controls:

- `UContainer` for page width and padding
- `UCard` for the game surface
- `UBadge` for turn or result status
- `UButton` for new-round and other actions
- `UInput` for display name and room code in the stretch lobby

Use a native `<button type="button">` for each board cell. It is simpler to give the highly custom square control correct states and an explicit accessible name while still using Nuxt UI's semantic colors in its Tailwind classes.

Suggested board classes:

```text
grid grid-cols-3 w-full max-w-md aspect-square gap-2
```

Suggested cell principles:

- `aspect-square` so every cell remains square
- a large visible `X` or `O`, not an icon with no text alternative
- `focus-visible` ring styles
- at least a 44-by-44 px target at the smallest supported viewport
- `transition-colors` only; avoid layout-shifting hover effects
- `motion-reduce:transition-none`
- semantic classes such as `bg-elevated`, `border-default`, `text-highlighted`, and primary/error colors rather than hard-coded light-only colors

Tailwind's responsive variants are mobile-first. Start with a single-column layout and add a side score/control column at a wider breakpoint. The approved Pencil wireframes cover desktop single-player, online lobby, online match, and a 390-by-844 mobile single-player layout; exported references live in `docs/wireframes/`.

## Accessibility contract

The visually gridded board does not need `role="grid"` for the MVP. The WAI-ARIA grid pattern is a composite widget and obligates the implementation to manage a single tab stop plus arrow-key focus movement. A semantic group of native buttons is valid, simpler, and less likely to ship incomplete keyboard behavior.

Use:

- `role="group"` and `aria-label="Tic-tac-toe board"` on the board container.
- An accessible name such as `"Row 1, column 2, empty"` or `"Row 1, column 2, X"` for each cell.
- `aria-disabled="true"` for an occupied or unavailable cell while keeping click handlers guarded. This keeps its state discoverable; a native `disabled` button is removed from sequential keyboard focus.
- A `role="status"` or `aria-live="polite"` status message for turns and outcomes.
- Visible text as well as color to distinguish marks and results.
- A clear focus indicator and WCAG 2.2 AA contrast.
- A connection status that uses text as well as a colored dot in online mode.
- Focus movement to the relevant status or lobby error only when it prevents progress; do not announce latency changes continuously.

If arrow-key board navigation is added, then implement the complete grid interaction as a unit: roving `tabindex`, left/right/up/down movement, and appropriate row/cell roles. Do not add only `role="grid"` without its keyboard behavior.

## Test setup

Current Nuxt documentation recommends Vitest projects so plain unit tests run in Node while only Nuxt-aware tests initialize the Nuxt runtime. This is the right tradeoff for the timebox.

Install:

```bash
pnpm add -D @nuxt/test-utils vitest @vue/test-utils happy-dom
```

`playwright-core` is an optional peer used by the built-in browser helpers. It can be omitted until browser end-to-end tests are actually added.

Add scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:unit": "vitest --project unit",
    "test:nuxt": "vitest --project nuxt"
  }
}
```

Use project-based configuration:

```ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node'
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
```

The repository already uses ESM through `"type": "module"`, which the Nuxt test-utils configuration requires.

### Unit test matrix

`test/unit/tic-tac-toe.test.ts`:

- creates nine empty cells
- detects all eight winning lines
- returns the correct winner and winning line
- detects a full-board draw
- does not label a nonterminal board a draw
- allows a mark in an empty in-range cell
- rejects occupied, out-of-range, and post-game moves
- never mutates the original board

`test/unit/tic-tac-toe-ai.test.ts`:

- Easy takes an immediate win
- Easy returns the expected legal move with an injected random value
- Easy returns `null` for a finished or full board
- Hard takes an immediate win
- Hard blocks an immediate loss
- Hard prefers center on an empty board
- Hard returns only a legal move
- Hard returns `null` for a finished or full board
- Hard is deterministic for an identical board
- neither strategy mutates the input

If time permits, recursively enumerate possible human responses and assert that the optimal computer cannot lose. The focused tactical tests above are the minimum useful set.

### Nuxt component test matrix

Use `mountSuspended` from `@nuxt/test-utils/runtime`, which wraps Vue Test Utils inside an initialized Nuxt environment.

- renders nine named cell buttons
- accepts a human move and displays `X`
- prevents a second choice while the computer is thinking
- applies one computer move after the delay
- updates the live status text
- refuses an occupied cell
- ends and announces win/draw states
- highlights the winning three cells
- new round clears the board and a pending computer timer
- scores change only once per finished round
- switching difficulty changes the following computer move without corrupting the board

If the WebSocket stretch is started, first unit-test `room-registry.ts`: two-player assignment, room capacity, out-of-turn and stale-revision rejection, terminal-state rejection, rematch agreement, and disconnect cleanup. Then smoke-test the full flow in two browser tabs. A complete network test harness is valuable but does not fit the initial timebox.

Tests should interact through rendered controls and assert visible output or emitted events. Avoid asserting private component/composable state and avoid snapshot-only tests. When a delay exists, use Vitest fake timers and restore them after each test.

## Two-hour delivery plan

| Elapsed time | Work | Exit condition |
| --- | --- | --- |
| 0–8 min | Install and configure Vitest and Nuxt Test Utils. | Empty unit and Nuxt projects run. |
| 8–22 min | Write engine tests and the pure engine. | Rule tests pass. |
| 22–36 min | Write Easy/Hard AI tests and strategies. | Both difficulty contracts pass. |
| 36–50 min | Build and test the single-player composable. | Legal repeated rounds work in both modes. |
| 50–70 min | Replace the starter and build the responsive Nuxt UI/Tailwind interface. | A complete round is playable through rendered controls. |
| 70–78 min | Add critical rendered tests and complete keyboard/status behavior. | The single-player release gate passes. |
| 78–120 min | Build the WebSocket vertical slice when the gate passes; otherwise stabilize and optionally add scores. | Best available release is green and clearly scoped. |

Use a hard gate around minute 75–78. Only start online mode if every earlier exit condition has already passed and at least 40–45 minutes remain; otherwise finish the stabilization path above and add the scoreboard only if the core is green. If the gate passes, spend the remaining time on one room-code vertical slice before considering the scoreboard: configure Nitro, implement typed events and an in-memory authoritative room, connect two tabs, then show a basic disconnect state. Defer persistence, matchmaking, spectators, chat, authentication, and robust reconnection.

## Definition of done

- A user can finish repeated human-versus-computer rounds without refreshing.
- Easy is beatable and Hard cannot be forced to lose.
- Illegal moves and input during the computer turn are ignored.
- Every win and draw is detected correctly.
- Both strategies return only legal moves; Hard blocks immediate losses.
- The game is operable with a keyboard and exposes useful cell/status names.
- The page works at the 390 px mobile reference and on desktop.
- Unit, Nuxt component, lint, and typecheck commands pass.
- The session scoreboard is included only if it does not compromise the requirements above.
- Online code exists only if the minute-75 gate passed. If included, two named players can join by room code, server-authoritative moves stay synchronized in two tabs, and disconnects lock the board visibly.

## Sources

- [Nuxt 4 directory structure](https://nuxt.com/docs/4.x/directory-structure/)
- [Nuxt 4 shared directory](https://nuxt.com/docs/4.x/directory-structure/shared)
- [Nuxt 4 composables directory](https://nuxt.com/docs/4.x/directory-structure/app/composables)
- [Nuxt 4 testing and `@nuxt/test-utils`](https://nuxt.com/docs/4.x/getting-started/testing)
- [Nuxt 4 server directory and Nitro configuration](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt UI installation for Nuxt](https://ui.nuxt.com/docs/getting-started/installation/nuxt)
- [Nuxt UI design system and theming](https://ui.nuxt.com/docs/getting-started/theme/design-system)
- [Nitro WebSocket guide](https://nitro.build/guide/websocket)
- [Vitest projects](https://vitest.dev/guide/projects)
- [Vue testing guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Tailwind CSS responsive design](https://tailwindcss.com/docs/responsive-design)
- [WAI-ARIA Authoring Practices grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Cornell adversarial search notes featuring tic-tac-toe and minimax](https://www.cs.cornell.edu/courses/cs4700/2017fa/lectures/pdf/CS4700-05-Search_adversarial_v1.pdf)
