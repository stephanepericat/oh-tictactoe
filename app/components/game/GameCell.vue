<script setup lang="ts">
import { computed } from 'vue'
import type { Mark } from '#shared/types/tic-tac-toe'

interface Props {
  index: number
  mark: Mark | null
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
        class="select-none font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-none tracking-[-0.08em]"
        :class="mark === 'X' ? 'text-[var(--game-ink)]' : 'text-[var(--game-accent)]'"
      >
        {{ mark }}
      </span>
      <span
        v-else-if="!unavailable"
        aria-hidden="true"
        class="size-2 rounded-full bg-[var(--game-border)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none"
      />
      <span
        v-if="winning"
        class="absolute inset-x-5 bottom-3 h-0.5 bg-[var(--game-accent)]"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
