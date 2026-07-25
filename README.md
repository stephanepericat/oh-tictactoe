# Oh! Tic-Tac-Toe

Oh! Tic-Tac-Toe is a single-player Nuxt 4 game built with Nuxt UI and Tailwind CSS. Play as X against a quick Easy opponent or an unbeatable Hard opponent powered by minimax.

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

Open [http://localhost:3000](http://localhost:3000) and select an empty square to play. Hard mode is active by default; selecting Easy schedules that difficulty for the next round.

## Quality checks

Run the automated test suite:

```bash
pnpm test:run
```

Run the remaining project checks:

```bash
pnpm typecheck
pnpm lint
```

## Production

Build and preview the production application:

```bash
pnpm build
pnpm preview
```

The preview server prints its local URL when it starts.
