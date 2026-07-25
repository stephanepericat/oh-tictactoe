<script setup lang="ts">
import type { Difficulty } from '#shared/types/tic-tac-toe'

interface Props {
  roundDifficulty: Difficulty
  nextDifficulty: Difficulty
  difficultyChangePending: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  difficulty: [difficulty: Difficulty]
  newRound: []
}>()

const difficulties: readonly Difficulty[] = ['hard', 'easy']
</script>

<template>
  <aside class="border-t border-[var(--game-border)] pt-7 lg:border-t-0 lg:pt-0">
    <section aria-labelledby="difficulty-title">
      <div class="flex items-end justify-between gap-4">
        <h2
          id="difficulty-title"
          class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--game-text-muted)]"
        >
          Difficulty
        </h2>
        <span class="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-[var(--game-text-muted)]">
          {{ difficultyChangePending ? 'Changes next round' : 'Active this round' }}
        </span>
      </div>

      <div
        role="group"
        aria-label="Difficulty"
        class="mt-3 grid grid-cols-2 rounded-[10px] bg-[var(--game-surface-strong)] p-1"
      >
        <button
          v-for="difficulty in difficulties"
          :key="difficulty"
          type="button"
          :aria-pressed="nextDifficulty === difficulty"
          class="min-h-11 rounded-[7px] px-4 text-sm font-semibold capitalize transition-[background-color,color] duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--game-accent)] motion-reduce:transition-none"
          :class="nextDifficulty === difficulty
            ? 'bg-[var(--game-ink)] text-[var(--game-paper)]'
            : 'text-[var(--game-text-secondary)] hover:text-[var(--game-ink)]'"
          @click="emit('difficulty', difficulty)"
        >
          {{ difficulty }}
        </button>
      </div>

      <p
        v-if="difficultyChangePending"
        class="mt-3 text-sm leading-6 text-[var(--game-text-secondary)]"
      >
        Finish this round on {{ roundDifficulty }}. The next one starts on {{ nextDifficulty }}.
      </p>
    </section>

    <section
      aria-labelledby="opponent-title"
      class="mt-7 border-y border-[var(--game-border)] py-6"
    >
      <h2
        id="opponent-title"
        class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--game-text-muted)]"
      >
        Opponent
      </h2>
      <div class="mt-3 flex items-center justify-between gap-4">
        <span class="inline-flex items-center gap-2.5 font-mono text-lg font-semibold text-[var(--game-ink)]">
          <UIcon
            name="i-lucide-bot"
            class="size-5"
            aria-hidden="true"
          />
          {{ roundDifficulty === 'hard' ? 'minimax()' : 'quickPick()' }}
        </span>
        <span class="rounded-md bg-[var(--game-surface-strong)] px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--game-text-muted)]">
          {{ roundDifficulty === 'hard' ? 'Unbeaten' : 'Fallible' }}
        </span>
      </div>
    </section>

    <div class="mt-7 rounded-[12px] bg-[var(--game-surface-strong)] p-5">
      <div class="flex gap-3">
        <UIcon
          name="i-lucide-terminal"
          class="mt-0.5 size-5 shrink-0 text-[var(--game-accent)]"
          aria-hidden="true"
        />
        <p class="text-sm leading-6 text-[var(--game-text-secondary)]">
          <template v-if="roundDifficulty === 'hard'">
            Hard mode explores the full game tree. Your best outcome is still respectable.
          </template>
          <template v-else>
            Easy mode sees obvious wins, then trusts its instincts. Its instincts are questionable.
          </template>
        </p>
      </div>
    </div>

    <UButton
      type="button"
      size="xl"
      block
      class="mt-7 min-h-14 justify-center rounded-[10px] bg-[var(--game-accent-strong)] text-base font-semibold text-[var(--game-paper)] hover:bg-[var(--game-accent-deep)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--game-ink)]"
      @click="emit('newRound')"
    >
      New round
    </UButton>
  </aside>
</template>
