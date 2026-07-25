<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef } from 'vue'
import type { Board, GamePhase, Mark, WinningLine } from '#shared/types/tic-tac-toe'

interface Props {
  board: Board
  phase: GamePhase
  humanMark: Mark
  winningLine: WinningLine | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [index: number]
}>()

const grid = useTemplateRef<HTMLDivElement>('grid')
const focusedIndex = shallowRef(0)
const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]] as const

function isUnavailable(index: number): boolean {
  return props.phase !== 'human-turn' || props.board[index] !== null
}

function isWinning(index: number): boolean {
  return props.winningLine?.includes(index) ?? false
}

function handleKeydown(event: KeyboardEvent): void {
  const current = focusedIndex.value
  const row = Math.floor(current / 3)
  const column = current % 3
  let next = current

  switch (event.key) {
    case 'ArrowLeft':
      next = column > 0 ? current - 1 : current
      break
    case 'ArrowRight':
      next = column < 2 ? current + 1 : current
      break
    case 'ArrowUp':
      next = row > 0 ? current - 3 : current
      break
    case 'ArrowDown':
      next = row < 2 ? current + 3 : current
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 8
      break
    default:
      return
  }

  event.preventDefault()
  focusCell(next)
}

async function focusCell(index: number): Promise<void> {
  focusedIndex.value = index
  await nextTick()
  grid.value
    ?.querySelector<HTMLButtonElement>(`[data-cell-index="${index}"]`)
    ?.focus()
}
</script>

<template>
  <div
    ref="grid"
    role="grid"
    aria-label="Tic-tac-toe board"
    aria-rowcount="3"
    aria-colcount="3"
    class="grid w-full max-w-[620px] gap-2.5 sm:gap-3"
    @keydown="handleKeydown"
  >
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      role="row"
      class="grid grid-cols-3 gap-2.5 sm:gap-3"
    >
      <GameCell
        v-for="index in row"
        :key="index"
        :index="index"
        :mark="board[index]"
        :preview-mark="humanMark"
        :unavailable="isUnavailable(index)"
        :winning="isWinning(index)"
        :tab-index="focusedIndex === index ? 0 : -1"
        @select="emit('select', $event)"
        @focus="focusedIndex = $event"
      />
    </div>
  </div>
</template>
