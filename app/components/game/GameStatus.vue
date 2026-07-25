<script setup lang="ts">
import type { Difficulty, GamePhase, GameResult } from '#shared/types/tic-tac-toe'

interface Props {
  roundNumber: number
  difficulty: Difficulty
  phase: GamePhase
  result: GameResult
  title: string
  detail: string
}

defineProps<Props>()
</script>

<template>
  <div class="max-w-3xl">
    <p class="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--game-text-muted)] sm:text-xs">
      Round {{ String(roundNumber).padStart(2, '0') }}
      <span
        aria-hidden="true"
        class="px-2.5"
      >/</span>
      {{ difficulty }} mode
      <span
        aria-hidden="true"
        class="px-2.5"
      >/</span>
      You are X
    </p>

    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="mt-4"
    >
      <h1 class="font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[0.94] tracking-[-0.055em] text-[var(--game-ink)]">
        {{ title }}
      </h1>
      <p class="mt-5 max-w-[62ch] text-base leading-7 text-[var(--game-text-secondary)] sm:text-lg">
        {{ detail }}
      </p>
    </div>

    <div class="mt-5">
      <UBadge
        v-if="phase === 'computer-turn'"
        color="neutral"
        variant="soft"
        size="lg"
        class="gap-2 rounded-md bg-[var(--game-surface-strong)] px-4 py-2 font-mono text-xs font-semibold tracking-[0.12em] text-[var(--game-text-secondary)]"
      >
        <span
          class="size-2 animate-pulse rounded-full bg-[var(--game-text-muted)] motion-reduce:animate-none"
          aria-hidden="true"
        />
        CPU TURN
      </UBadge>
      <UBadge
        v-else-if="result.status === 'won'"
        :color="result.winner === 'X' ? 'success' : 'primary'"
        variant="soft"
        size="lg"
        class="gap-2 rounded-md px-4 py-2 font-mono text-xs font-semibold tracking-[0.12em]"
      >
        <span
          class="size-2 rounded-full bg-current"
          aria-hidden="true"
        />
        {{ result.winner === 'X' ? 'LINE FOUND' : 'CPU WINS' }}
      </UBadge>
      <UBadge
        v-else-if="result.status === 'draw'"
        color="neutral"
        variant="soft"
        size="lg"
        class="gap-2 rounded-md px-4 py-2 font-mono text-xs font-semibold tracking-[0.12em]"
      >
        <span
          class="size-2 rounded-full bg-current"
          aria-hidden="true"
        />
        DRAW
      </UBadge>
      <UBadge
        v-else
        color="primary"
        variant="soft"
        size="lg"
        class="gap-2 rounded-md bg-[var(--game-accent-soft)] px-4 py-2 font-mono text-xs font-semibold tracking-[0.12em] text-[var(--game-accent-strong)]"
      >
        <span
          class="size-2 rounded-full bg-[var(--game-accent)]"
          aria-hidden="true"
        />
        YOUR TURN
      </UBadge>
    </div>
  </div>
</template>
