import { computed, onScopeDispose, readonly, shallowRef } from 'vue'
import type { Board, Difficulty, GamePhase } from '#shared/types/tic-tac-toe'
import { chooseEasyMove, chooseHardMove } from '#shared/utils/tic-tac-toe-ai'
import { createBoard, getGameResult, placeMark } from '#shared/utils/tic-tac-toe'

interface UseTicTacToeOptions {
  computerDelay?: number
  random?: () => number
}

const HUMAN_MARK = 'X'
const COMPUTER_MARK = 'O'

export function useTicTacToe(options: UseTicTacToeOptions = {}) {
  const {
    computerDelay = 260,
    random = Math.random
  } = options

  const board = shallowRef<Board>(createBoard())
  const phase = shallowRef<GamePhase>('human-turn')
  const roundDifficulty = shallowRef<Difficulty>('hard')
  const nextDifficulty = shallowRef<Difficulty>('hard')
  const roundNumber = shallowRef(1)
  let computerTimer: ReturnType<typeof setTimeout> | undefined

  const result = computed(() => getGameResult(board.value))
  const winningLine = computed(() => (
    result.value.status === 'won' ? result.value.line : null
  ))
  const canHumanPlay = computed(() => (
    phase.value === 'human-turn' && result.value.status === 'playing'
  ))
  const difficultyChangePending = computed(() => (
    roundDifficulty.value !== nextDifficulty.value
  ))

  const statusTitle = computed(() => {
    if (phase.value === 'computer-turn') {
      return 'The machine is thinking.'
    }

    if (result.value.status === 'draw') {
      return 'A respectable deadlock.'
    }

    if (result.value.status === 'won') {
      return result.value.winner === HUMAN_MARK
        ? 'You found the line.'
        : 'The machine wins this one.'
    }

    return 'Your move, human.'
  })

  const statusDetail = computed(() => {
    if (phase.value === 'computer-turn') {
      return roundDifficulty.value === 'hard'
        ? 'Evaluating every legal continuation.'
        : 'Taking a quick look around.'
    }

    if (result.value.status === 'draw') {
      return 'Nine moves. Zero regrets. Start another round.'
    }

    if (result.value.status === 'won') {
      return result.value.winner === HUMAN_MARK
        ? 'The search tree did not see that coming.'
        : 'There was only one safe line. It found it.'
    }

    return roundDifficulty.value === 'hard'
      ? 'The machine considered every future. One of them is still yours.'
      : 'The machine left a few branches unexplored. Be kind.'
  })

  function playCell(index: number): boolean {
    if (!canHumanPlay.value) {
      return false
    }

    const nextBoard = placeMark(board.value, index, HUMAN_MARK)

    if (!nextBoard) {
      return false
    }

    board.value = nextBoard

    if (finishIfTerminal()) {
      return true
    }

    phase.value = 'computer-turn'
    computerTimer = setTimeout(playComputerTurn, computerDelay)

    return true
  }

  function setNextDifficulty(difficulty: Difficulty): void {
    nextDifficulty.value = difficulty
  }

  function newRound(): void {
    clearComputerTurn()
    board.value = createBoard()
    roundDifficulty.value = nextDifficulty.value
    roundNumber.value += 1
    phase.value = 'human-turn'
  }

  function playComputerTurn(): void {
    computerTimer = undefined

    if (phase.value !== 'computer-turn' || result.value.status !== 'playing') {
      return
    }

    const move = roundDifficulty.value === 'hard'
      ? chooseHardMove(board.value, COMPUTER_MARK, HUMAN_MARK)
      : chooseEasyMove(board.value, COMPUTER_MARK, random)

    if (move === null) {
      phase.value = 'finished'
      return
    }

    const nextBoard = placeMark(board.value, move, COMPUTER_MARK)

    if (!nextBoard) {
      phase.value = 'finished'
      return
    }

    board.value = nextBoard

    if (!finishIfTerminal()) {
      phase.value = 'human-turn'
    }
  }

  function finishIfTerminal(): boolean {
    if (result.value.status === 'playing') {
      return false
    }

    phase.value = 'finished'
    clearComputerTurn()
    return true
  }

  function clearComputerTurn(): void {
    if (computerTimer !== undefined) {
      clearTimeout(computerTimer)
      computerTimer = undefined
    }
  }

  onScopeDispose(clearComputerTurn)

  return {
    board: readonly(board),
    phase: readonly(phase),
    result,
    winningLine,
    canHumanPlay,
    roundDifficulty: readonly(roundDifficulty),
    nextDifficulty: readonly(nextDifficulty),
    difficultyChangePending,
    roundNumber: readonly(roundNumber),
    statusTitle,
    statusDetail,
    playCell,
    setNextDifficulty,
    newRound
  }
}
