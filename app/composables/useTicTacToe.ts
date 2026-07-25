import { computed, onScopeDispose, readonly, shallowRef } from 'vue'
import type { Board, Difficulty, GamePhase, Mark, SessionScore } from '#shared/types/tic-tac-toe'
import { chooseEasyMove, chooseHardMove } from '#shared/utils/tic-tac-toe-ai'
import { createBoard, getGameResult, placeMark } from '#shared/utils/tic-tac-toe'

interface UseTicTacToeOptions {
  random?: () => number
}

export function useTicTacToe(options: UseTicTacToeOptions = {}) {
  const { random = Math.random } = options

  const board = shallowRef<Board>(createBoard())
  const phase = shallowRef<GamePhase>('human-turn')
  const roundDifficulty = shallowRef<Difficulty>('hard')
  const nextDifficulty = shallowRef<Difficulty>('hard')
  const roundHumanMark = shallowRef<Mark>('X')
  const roundNumber = shallowRef(1)
  const scores = shallowRef<SessionScore>({
    human: 0,
    computer: 0,
    draws: 0
  })
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
  const computerMark = computed<Mark>(() => (
    roundHumanMark.value === 'X' ? 'O' : 'X'
  ))

  const statusTitle = computed(() => {
    if (phase.value === 'computer-turn') {
      return 'The machine is thinking.'
    }

    if (result.value.status === 'draw') {
      return 'A respectable deadlock.'
    }

    if (result.value.status === 'won') {
      return result.value.winner === roundHumanMark.value
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
      return result.value.winner === roundHumanMark.value
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

    const nextBoard = placeMark(board.value, index, roundHumanMark.value)

    if (!nextBoard) {
      return false
    }

    board.value = nextBoard

    if (finishIfTerminal()) {
      return true
    }

    scheduleComputerTurn()

    return true
  }

  function setNextDifficulty(difficulty: Difficulty): void {
    nextDifficulty.value = difficulty
  }

  function setHumanMark(mark: Mark): void {
    if (roundHumanMark.value === mark) {
      return
    }

    roundHumanMark.value = mark
    newRound()
  }

  function newRound(): void {
    clearComputerTurn()
    board.value = createBoard()
    roundDifficulty.value = nextDifficulty.value
    roundNumber.value += 1

    if (roundHumanMark.value === 'X') {
      phase.value = 'human-turn'
    } else {
      scheduleComputerTurn()
    }
  }

  function resetScores(): void {
    scores.value = {
      human: 0,
      computer: 0,
      draws: 0
    }
  }

  function playComputerTurn(): void {
    computerTimer = undefined

    if (phase.value !== 'computer-turn' || result.value.status !== 'playing') {
      return
    }

    const move = roundDifficulty.value === 'hard'
      ? chooseHardMove(board.value, computerMark.value, roundHumanMark.value)
      : chooseEasyMove(board.value, computerMark.value, random)

    if (move === null) {
      return
    }

    board.value = placeMark(board.value, move, computerMark.value)!

    if (!finishIfTerminal()) {
      phase.value = 'human-turn'
    }
  }

  function finishIfTerminal(): boolean {
    const terminalResult = result.value

    if (terminalResult.status === 'playing') {
      return false
    }

    const scoreKey = terminalResult.status === 'draw'
      ? 'draws'
      : terminalResult.winner === roundHumanMark.value ? 'human' : 'computer'

    scores.value = {
      ...scores.value,
      [scoreKey]: scores.value[scoreKey] + 1
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

  function scheduleComputerTurn(): void {
    phase.value = 'computer-turn'
    computerTimer = setTimeout(playComputerTurn, 260)
  }

  onScopeDispose(clearComputerTurn)

  return {
    board: readonly(board),
    phase: readonly(phase),
    result,
    winningLine,
    roundDifficulty: readonly(roundDifficulty),
    nextDifficulty: readonly(nextDifficulty),
    difficultyChangePending,
    roundHumanMark: readonly(roundHumanMark),
    roundNumber: readonly(roundNumber),
    scores: readonly(scores),
    statusTitle,
    statusDetail,
    playCell,
    setNextDifficulty,
    setHumanMark,
    newRound,
    resetScores
  }
}
