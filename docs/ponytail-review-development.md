# Ponytail Review: Development Branch

Scope: `main...development` at `1f5f148`.

`app/pages/index.vue:L1-3, app/components/game/GameBoard.vue:L4, app/components/game/GameShell.vue:L2-5: native: explicit imports for components already covered by Nuxt component auto-imports. Delete the imports and let Nuxt resolve the components.`

`app/components/game/GameCell.vue:L121-126: delete: component-level reduced-motion override duplicates the global override in app/assets/css/main.css:L100-108. Nothing replaces it.`

`shared/utils/tic-tac-toe-ai.ts:L33-38: shrink: clamps and null-fallback defend against values Math.random never returns. legalMoves[Math.floor(random() * legalMoves.length)]!, 1 line.`

`shared/utils/tic-tac-toe.ts:L43-57: stdlib: manual accumulator builds the legal-move list. Array.prototype.flatMap behind the existing playing-state check.`

`shared/utils/tic-tac-toe.ts:L3-7,L70-73: native: MutableBoard duplicates Board solely to support copy-then-mutate. Array.prototype.with(index, mark) as Board.`

`app/composables/useTicTacToe.ts:L6-15,L212,L222: yagni: computerDelay is configurable but nobody configures it, and canHumanPlay is exposed but nobody consumes it. Hardcode the 260 ms delay and keep canHumanPlay private.`

`app/composables/useTicTacToe.ts:L151-161,L177-179: delete: fallback transitions for null/illegal computer moves and an already-finished phase are unreachable after the playing-phase guard and legal-move selection. Keep one null return for type narrowing; nothing replaces the other branches.`

`app/composables/useTicTacToe.ts:L181-196: shrink: three nearly identical score-update branches. Derive the score key once and perform one immutable increment.`

`test/nuxt/accessibility.test.ts:L118-148,L164-176: delete: a second full winning-game playthrough duplicates test/nuxt/game.test.ts:L136-159 and creates a one-use buttonNamed helper. Move the preview assertion to the initial accessibility test and the aria-hidden winning-line assertion to the existing winning-game test.`

`test/nuxt/accessibility.test.ts:L28-29: delete: color-mode accessible-name coverage duplicates test/nuxt/color-mode.test.ts:L15-26. Nothing replaces it.`

net: -103 lines possible.
