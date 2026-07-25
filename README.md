# Oh! Tic-Tac-Toe

Oh! Tic-Tac-Toe is a single-player Nuxt 4 game built with Nuxt UI and Tailwind CSS. Play as X or O against a quick Easy opponent or an unbeatable Hard opponent powered by local minimax.

The game includes a session scoreboard, responsive light and dark themes, complete keyboard controls, reduced-motion support, and screen-reader-friendly game status. See [FEATURES.md](FEATURES.md) for the complete feature list, current limitations, and multiplayer work deferred from the original two-hour plan.

## Requirements

- Node.js
- pnpm 11.13.1

## Setup

Install the dependencies from the project root:

```bash
pnpm install
```

The game does not require environment variables. You can copy the example file if you want a local `.env` ready for future configuration:

```bash
cp .env.example .env
```

## Development

Start the Nuxt development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and select an empty square to play. Hard mode is active by default, X opens every round, and selecting Easy schedules that difficulty for the next round.

## Quality checks

Run the automated test suite:

```bash
pnpm test:run
```

Run the remaining project checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Production

Preview a completed production build:

```bash
pnpm preview
```

The preview server prints its local URL when it starts.
