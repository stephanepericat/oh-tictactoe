import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import { useTicTacToe } from '../../app/composables/useTicTacToe'

describe('useTicTacToe', () => {
  let scope: EffectScope | undefined

  afterEach(() => {
    scope?.stop()
    scope = undefined
    vi.useRealTimers()
  })

  it('starts a Hard round with the human as X', () => {
    const game = createGame()

    expect(game.roundDifficulty.value).toBe('hard')
    expect(game.roundHumanMark.value).toBe('X')
    expect(game.phase.value).toBe('human-turn')
    expect(game.statusTitle.value).toBe('Your move, human.')
    expect(game.board.value).toEqual(Array(9).fill(null))
    expect(game.scores.value).toEqual({
      human: 0,
      computer: 0,
      draws: 0
    })
  })

  it('locks human input while the computer turn is pending', () => {
    vi.useFakeTimers()
    const game = createGame()

    expect(game.playCell(0)).toBe(true)
    expect(game.playCell(1)).toBe(false)
    expect(game.board.value[0]).toBe('X')
    expect(game.board.value[1]).toBeNull()
    expect(game.phase.value).toBe('computer-turn')

    vi.runOnlyPendingTimers()

    expect(game.board.value[4]).toBe('O')
    expect(game.phase.value).toBe('human-turn')
  })

  it('cancels a pending computer move when a new round starts', () => {
    vi.useFakeTimers()
    const game = createGame()

    game.playCell(0)
    game.newRound()
    vi.runAllTimers()

    expect(game.board.value).toEqual(Array(9).fill(null))
    expect(game.phase.value).toBe('human-turn')
    expect(game.roundNumber.value).toBe(2)
  })

  it('applies a difficulty change on the next round', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0.99 })

    game.setNextDifficulty('easy')

    expect(game.roundDifficulty.value).toBe('hard')
    expect(game.nextDifficulty.value).toBe('easy')
    expect(game.difficultyChangePending.value).toBe(true)

    game.newRound()
    game.playCell(0)
    vi.runOnlyPendingTimers()

    expect(game.roundDifficulty.value).toBe('easy')
    expect(game.difficultyChangePending.value).toBe(false)
    expect(game.board.value[8]).toBe('O')
  })

  it('switches to O immediately and lets the computer open as X', () => {
    vi.useFakeTimers()
    const game = createGame()

    game.setHumanMark('O')

    expect(game.roundHumanMark.value).toBe('O')
    expect(game.roundNumber.value).toBe(2)
    expect(game.phase.value).toBe('computer-turn')
    expect(game.board.value).toEqual(Array(9).fill(null))

    vi.runOnlyPendingTimers()

    expect(game.board.value[4]).toBe('X')
    expect(game.phase.value).toBe('human-turn')
    expect(game.playCell(0)).toBe(true)
    expect(game.board.value[0]).toBe('O')
  })

  it('cancels an opening computer turn when the next round switches back to X', () => {
    vi.useFakeTimers()
    const game = createGame()

    game.setHumanMark('O')
    game.setHumanMark('X')
    vi.runAllTimers()

    expect(game.roundHumanMark.value).toBe('X')
    expect(game.roundNumber.value).toBe(3)
    expect(game.phase.value).toBe('human-turn')
    expect(game.board.value).toEqual(Array(9).fill(null))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('attributes an O win to the human score', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0 })

    game.setNextDifficulty('easy')
    game.setHumanMark('O')
    vi.runOnlyPendingTimers()

    for (const move of [4, 2]) {
      game.playCell(move)
      vi.runOnlyPendingTimers()
    }

    game.playCell(6)

    expect(game.result.value).toEqual({
      status: 'won',
      winner: 'O',
      line: [2, 4, 6]
    })
    expect(game.statusTitle.value).toBe('You found the line.')
    expect(game.scores.value).toEqual({
      human: 1,
      computer: 0,
      draws: 0
    })
  })

  it('counts a human win once and preserves it across rounds', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0 })

    completeHumanWin(game)

    expect(game.result.value).toEqual({
      status: 'won',
      winner: 'X',
      line: [0, 3, 6]
    })
    expect(game.phase.value).toBe('finished')
    expect(game.statusTitle.value).toBe('You found the line.')
    expect(game.playCell(8)).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    expect(game.scores.value.human).toBe(1)

    game.newRound()

    expect(game.scores.value.human).toBe(1)
  })

  it('counts a computer win', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0 })

    game.setNextDifficulty('easy')
    game.newRound()

    for (const move of [0, 3, 5, 8]) {
      game.playCell(move)
      vi.runOnlyPendingTimers()
    }

    expect(game.result.value.status).toBe('won')
    expect(game.scores.value).toEqual({
      human: 0,
      computer: 1,
      draws: 0
    })
  })

  it('counts a draw', () => {
    vi.useFakeTimers()
    const game = createGame()

    for (const move of [0, 1, 6, 5, 7]) {
      game.playCell(move)
      vi.runOnlyPendingTimers()
    }

    expect(game.result.value).toEqual({ status: 'draw' })
    expect(game.scores.value).toEqual({
      human: 0,
      computer: 0,
      draws: 1
    })
  })

  it('resets every session score without starting a new round', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0 })

    completeHumanWin(game)
    const roundNumber = game.roundNumber.value
    game.resetScores()

    expect(game.scores.value).toEqual({
      human: 0,
      computer: 0,
      draws: 0
    })
    expect(game.roundNumber.value).toBe(roundNumber)
    expect(game.result.value.status).toBe('won')
  })

  function createGame(options: Parameters<typeof useTicTacToe>[0] = {}) {
    scope = effectScope()

    const game = scope.run(() => useTicTacToe(options))

    if (!game) {
      throw new Error('Failed to create game scope')
    }

    return game
  }

  function completeHumanWin(game: ReturnType<typeof useTicTacToe>): void {
    game.setNextDifficulty('easy')
    game.newRound()
    game.playCell(0)
    vi.runOnlyPendingTimers()
    game.playCell(3)
    vi.runOnlyPendingTimers()
    game.playCell(6)
  }
})
