<script setup lang="ts">
import { computed } from 'vue'
import type { SessionScore } from '#shared/types/tic-tac-toe'

interface Props {
  scores: Readonly<SessionScore>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reset: []
}>()

const scoreItems = computed(() => [
  {
    key: 'human',
    label: 'You',
    value: props.scores.human,
    unit: 'win',
    accent: true
  },
  {
    key: 'computer',
    label: 'CPU',
    value: props.scores.computer,
    unit: 'win',
    accent: false
  },
  {
    key: 'draws',
    label: 'Draws',
    value: props.scores.draws,
    unit: 'draw',
    accent: false
  }
] as const)

const hasScore = computed(() => (
  props.scores.human + props.scores.computer + props.scores.draws > 0
))

function scoreLabel(label: string, value: number, unit: 'win' | 'draw'): string {
  return `${label}, ${value} ${unit}${value === 1 ? '' : 's'}`
}
</script>

<template>
  <section
    aria-labelledby="session-score-title"
    class="border-b border-[var(--game-border)] pb-7"
  >
    <div class="flex items-center justify-between gap-4">
      <h2
        id="session-score-title"
        class="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--game-text-muted)]"
      >
        Session score
      </h2>

      <button
        type="button"
        :disabled="!hasScore"
        class="rounded-md px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[var(--game-text-muted)] transition-colors duration-150 hover:text-[var(--game-accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--game-accent)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
        @click="emit('reset')"
      >
        Reset score
      </button>
    </div>

    <dl class="mt-5 grid grid-cols-3 gap-4">
      <div
        v-for="item in scoreItems"
        :key="item.key"
        class="min-w-0"
      >
        <dt class="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--game-text-muted)]">
          {{ item.label }}
        </dt>
        <dd
          :aria-label="scoreLabel(item.label, item.value, item.unit)"
          class="mt-1 font-serif text-4xl leading-none tabular-nums"
          :class="item.accent ? 'text-[var(--game-accent-strong)]' : 'text-[var(--game-ink)]'"
        >
          {{ String(item.value).padStart(2, '0') }}
        </dd>
      </div>
    </dl>
  </section>
</template>
