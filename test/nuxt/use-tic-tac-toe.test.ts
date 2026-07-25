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
    expect(game.phase.value).toBe('human-turn')
    expect(game.statusTitle.value).toBe('Your move, human.')
    expect(game.board.value).toEqual(Array(9).fill(null))
  })

  it('locks human input while the computer turn is pending', () => {
    vi.useFakeTimers()
    const game = createGame()

    expect(game.playCell(0)).toBe(true)
    expect(game.playCell(1)).toBe(false)
    expect(game.board.value[0]).toBe('X')
    expect(game.board.value[1]).toBeNull()
    expect(game.phase.value).toBe('computer-turn')

    vi.advanceTimersByTime(260)

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
    vi.advanceTimersByTime(260)

    expect(game.roundDifficulty.value).toBe('easy')
    expect(game.difficultyChangePending.value).toBe(false)
    expect(game.board.value[8]).toBe('O')
  })

  it('finishes immediately when the human wins', () => {
    vi.useFakeTimers()
    const game = createGame({ random: () => 0 })

    game.setNextDifficulty('easy')
    game.newRound()

    game.playCell(0)
    vi.advanceTimersByTime(260)
    game.playCell(3)
    vi.advanceTimersByTime(260)
    game.playCell(6)

    expect(game.result.value).toEqual({
      status: 'won',
      winner: 'X',
      line: [0, 3, 6]
    })
    expect(game.phase.value).toBe('finished')
    expect(game.statusTitle.value).toBe('You found the line.')
    expect(game.playCell(8)).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  function createGame(options: Parameters<typeof useTicTacToe>[0] = {}) {
    scope = effectScope()

    const game = scope.run(() => useTicTacToe(options))

    if (!game) {
      throw new Error('Failed to create game scope')
    }

    return game
  }
})
