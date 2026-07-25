<script setup lang="ts">
import GameBoard from './GameBoard.vue'
import GameControls from './GameControls.vue'
import GameScoreboard from './GameScoreboard.vue'
import GameStatus from './GameStatus.vue'

const game = useTicTacToe()
</script>

<template>
  <UContainer class="py-10 sm:py-14 lg:py-20">
    <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 xl:gap-24">
      <main class="min-w-0">
        <GameStatus
          :round-number="game.roundNumber.value"
          :difficulty="game.roundDifficulty.value"
          :human-mark="game.roundHumanMark.value"
          :phase="game.phase.value"
          :result="game.result.value"
          :title="game.statusTitle.value"
          :detail="game.statusDetail.value"
        />

        <div class="mt-7 sm:mt-9">
          <GameBoard
            :board="game.board.value"
            :phase="game.phase.value"
            :human-mark="game.roundHumanMark.value"
            :winning-line="game.winningLine.value"
            @select="game.playCell"
          />
        </div>

        <div class="mt-5 flex max-w-[620px] flex-wrap items-center justify-between gap-3 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--game-text-muted)]">
          <span class="inline-flex items-center gap-2">
            <UKbd>↑↓←→</UKbd>
            to move
            <span aria-hidden="true">·</span>
            <UKbd>Enter</UKbd>
            to place
          </span>
          <span>3 × 3&nbsp;&nbsp;/&nbsp;&nbsp;best of ∞</span>
        </div>
      </main>

      <aside class="border-t border-[var(--game-border)] pt-7 lg:sticky lg:top-28 lg:border-t-0 lg:pt-0">
        <GameScoreboard
          :scores="game.scores.value"
          @reset="game.resetScores"
        />

        <GameControls
          class="mt-7"
          :round-difficulty="game.roundDifficulty.value"
          :next-difficulty="game.nextDifficulty.value"
          :difficulty-change-pending="game.difficultyChangePending.value"
          :human-mark="game.roundHumanMark.value"
          :round-finished="game.phase.value === 'finished'"
          @difficulty="game.setNextDifficulty"
          @mark="game.setHumanMark"
          @new-round="game.newRound"
        />
      </aside>
    </div>
  </UContainer>
</template>
