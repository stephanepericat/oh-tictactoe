import { describe, expect, it } from 'vitest'
import type { Board, Mark } from '../../shared/types/tic-tac-toe'
import { chooseEasyMove, chooseHardMove } from '../../shared/utils/tic-tac-toe-ai'
import { createBoard, getGameResult, getLegalMoves, placeMark } from '../../shared/utils/tic-tac-toe'

describe('easy computer', () => {
  it('takes an immediate win', () => {
    const board: Board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ]

    expect(chooseEasyMove(board, 'O', () => 0.99)).toBe(2)
  })

  it('uses an injected random source to choose a legal move', () => {
    const board: Board = [
      'X', null, null,
      null, 'O', null,
      null, null, null
    ]

    expect(chooseEasyMove(board, 'O', () => 0)).toBe(1)
    expect(chooseEasyMove(board, 'O', () => 0.99)).toBe(8)
  })

  it('returns null for a finished board', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ]

    expect(chooseEasyMove(board, 'O')).toBeNull()
  })

  it('does not mutate the board', () => {
    const board = createBoard()
    const snapshot = [...board]

    chooseEasyMove(board, 'O', () => 0.5)

    expect(board).toEqual(snapshot)
  })
})

describe('hard computer', () => {
  it('takes an immediate win', () => {
    const board: Board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ]

    expect(chooseHardMove(board, 'O', 'X')).toBe(2)
  })

  it('blocks an immediate human win', () => {
    const board: Board = [
      'X', 'X', null,
      'O', null, null,
      null, 'O', null
    ]

    expect(chooseHardMove(board, 'O', 'X')).toBe(2)
  })

  it('prefers the center on an empty board', () => {
    expect(chooseHardMove(createBoard(), 'O', 'X')).toBe(4)
  })

  it('is deterministic for the same board', () => {
    const board: Board = [
      'X', null, null,
      null, 'O', null,
      null, null, 'X'
    ]
    const firstMove = chooseHardMove(board, 'O', 'X')

    expect(firstMove).not.toBeNull()
    expect(chooseHardMove(board, 'O', 'X')).toBe(firstMove)
  })

  it('returns only a legal move', () => {
    const board: Board = [
      'X', null, 'O',
      null, 'X', null,
      null, 'O', null
    ]
    const move = chooseHardMove(board, 'O', 'X')

    expect(move).not.toBeNull()
    expect(getLegalMoves(board)).toContain(move)
  })

  it('returns null for a finished board', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ]

    expect(chooseHardMove(board, 'O', 'X')).toBeNull()
  })

  it('does not mutate the board', () => {
    const board = createBoard()
    const snapshot = [...board]

    chooseHardMove(board, 'O', 'X')

    expect(board).toEqual(snapshot)
  })

  it('cannot be forced to lose when it plays O', () => {
    expect(humanCanForceWin(createBoard(), 'X', 'X', 'O')).toBe(false)
  })

  it('cannot be forced to lose when it plays X', () => {
    expect(humanCanForceWin(createBoard(), 'X', 'O', 'X')).toBe(false)
  })
})

function humanCanForceWin(
  board: Board,
  currentMark: Mark,
  humanMark: Mark,
  computerMark: Mark
): boolean {
  const result = getGameResult(board)

  if (result.status === 'won') {
    return result.winner === humanMark
  }

  if (result.status === 'draw') {
    return false
  }

  if (currentMark === computerMark) {
    const move = chooseHardMove(board, computerMark, humanMark)

    if (move === null) {
      throw new Error('Hard mode returned no move for a playable board')
    }

    const nextBoard = placeMark(board, move, computerMark)

    if (!nextBoard) {
      throw new Error(`Hard mode returned illegal move ${move}`)
    }

    return humanCanForceWin(nextBoard, humanMark, humanMark, computerMark)
  }

  return getLegalMoves(board).some((move) => {
    const nextBoard = placeMark(board, move, humanMark)

    if (!nextBoard) {
      throw new Error(`Human move ${move} was unexpectedly rejected`)
    }

    return humanCanForceWin(nextBoard, computerMark, humanMark, computerMark)
  })
}
