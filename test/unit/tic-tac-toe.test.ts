import { describe, expect, it } from 'vitest'
import type { Board, WinningLine } from '../../shared/types/tic-tac-toe'
import {
  createBoard,
  getGameResult,
  getLegalMoves,
  placeMark,
  WINNING_LINES
} from '../../shared/utils/tic-tac-toe'

describe('tic-tac-toe rules', () => {
  it('creates a board with nine empty cells', () => {
    expect(createBoard()).toEqual(Array(9).fill(null))
  })

  it('places a mark without mutating the source board', () => {
    const board = createBoard()
    const nextBoard = placeMark(board, 4, 'X')

    expect(nextBoard?.[4]).toBe('X')
    expect(board[4]).toBeNull()
    expect(nextBoard).not.toBe(board)
  })

  it.each([
    [-1],
    [9],
    [1.5]
  ])('rejects an out-of-range or non-integer move at %s', (index) => {
    expect(placeMark(createBoard(), index, 'X')).toBeNull()
  })

  it('rejects an occupied cell', () => {
    const board = placeMark(createBoard(), 0, 'X')

    expect(board).not.toBeNull()
    expect(placeMark(board!, 0, 'O')).toBeNull()
  })

  it.each(WINNING_LINES.map(line => [line] as const))('detects winning line %s', (line) => {
    const board = boardWithLine(line, 'X')

    expect(getGameResult(board)).toEqual({
      status: 'won',
      winner: 'X',
      line
    })
  })

  it('detects a full-board draw', () => {
    const board: Board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ]

    expect(getGameResult(board)).toEqual({ status: 'draw' })
    expect(getLegalMoves(board)).toEqual([])
  })

  it('does not label a nonterminal board as a draw', () => {
    const board: Board = [
      'X', 'O', 'X',
      null, 'O', null,
      null, 'X', null
    ]

    expect(getGameResult(board)).toEqual({ status: 'playing' })
    expect(getLegalMoves(board)).toEqual([3, 5, 6, 8])
  })

  it('rejects moves after the game has ended', () => {
    const board: Board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ]

    expect(placeMark(board, 5, 'O')).toBeNull()
  })
})

function boardWithLine(line: WinningLine, mark: 'X' | 'O'): Board {
  const board = [...createBoard()] as [
    null | 'X' | 'O', null | 'X' | 'O', null | 'X' | 'O',
    null | 'X' | 'O', null | 'X' | 'O', null | 'X' | 'O',
    null | 'X' | 'O', null | 'X' | 'O', null | 'X' | 'O'
  ]

  line.forEach((index) => {
    board[index] = mark
  })

  return board
}
