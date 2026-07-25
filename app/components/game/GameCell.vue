<script setup lang="ts">
import { computed } from 'vue'
import type { Mark } from '#shared/types/tic-tac-toe'

interface Props {
  index: number
  mark: Mark | null
  previewMark: Mark
  unavailable: boolean
  winning: boolean
  tabIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [index: number]
  focus: [index: number]
}>()

const row = computed(() => Math.floor(props.index / 3) + 1)
const column = computed(() => (props.index % 3) + 1)
const accessibleLabel = computed(() => (
  `Row ${row.value}, column ${column.value}, ${props.mark ?? 'empty'}`
))

function selectCell(): void {
  if (!props.unavailable && props.mark === null) {
    emit('select', props.index)
  }
}
</script>

<template>
  <div
    role="gridcell"
    class="aspect-square min-w-0"
  >
    <button
      type="button"
      :data-cell-index="index"
      :data-mark="mark ?? undefined"
      :data-winning="winning || undefined"
      :tabindex="tabIndex"
      :aria-label="accessibleLabel"
      :aria-disabled="unavailable || mark !== null"
      class="game-cell group relative flex size-full items-center justify-center overflow-hidden rounded-[13px] border bg-[var(--game-surface)] transition-[background-color,border-color,color,transform] duration-150 ease-out focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--game-accent)] motion-reduce:transition-none"
      :class="[
        winning
          ? 'border-[var(--game-accent)] bg-[var(--game-accent-soft)]'
          : 'border-[var(--game-ink)]',
        !unavailable && mark === null
          ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-[var(--game-surface-strong)]'
          : 'cursor-default'
      ]"
      @click="selectCell"
      @focus="emit('focus', index)"
    >
      <span
        v-if="mark"
        aria-hidden="true"
        data-placed-mark
        class="game-mark select-none font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-none tracking-[-0.08em]"
        :class="mark === 'X' ? 'text-[var(--game-ink)]' : 'text-[var(--game-accent)]'"
      >
        {{ mark }}
      </span>
      <span
        v-else-if="!unavailable"
        aria-hidden="true"
        :data-preview-mark="previewMark"
        class="select-none font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-none tracking-[-0.08em] opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:scale-[0.98] group-hover:opacity-15 group-focus-visible:scale-[0.98] group-focus-visible:opacity-15 motion-reduce:transition-none"
        :class="previewMark === 'X' ? 'text-[var(--game-ink)]' : 'text-[var(--game-accent)]'"
      >
        {{ previewMark }}
      </span>
      <span
        v-if="winning"
        data-winning-line
        class="game-winning-line absolute inset-x-5 bottom-3 h-0.5 bg-[var(--game-accent)]"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<style scoped>
.game-mark {
  animation: game-mark-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.game-winning-line {
  transform-origin: left center;
  animation: game-winning-line-enter 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes game-mark-enter {
  from {
    opacity: 0;
    transform: scale(0.78);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes game-winning-line-enter {
  from {
    opacity: 0;
    transform: scaleX(0);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-mark,
  .game-winning-line {
    animation: none;
  }
}
</style>
