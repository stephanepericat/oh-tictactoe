import type { Board, GameResult, Mark, WinningLine } from '../types/tic-tac-toe'

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
] as const satisfies readonly WinningLine[]

export function createBoard(): Board {
  return [
    null, null, null,
    null, null, null,
    null, null, null
  ]
}

export function getGameResult(board: Board): GameResult {
  for (const line of WINNING_LINES) {
    const [first, second, third] = line
    const mark = board[first]

    if (mark && mark === board[second] && mark === board[third]) {
      return { status: 'won', winner: mark, line }
    }
  }

  return board.every(cell => cell !== null)
    ? { status: 'draw' }
    : { status: 'playing' }
}

export function getLegalMoves(board: Board): number[] {
  return getGameResult(board).status === 'playing'
    ? board.flatMap((cell, index) => cell === null ? [index] : [])
    : []
}

export function placeMark(board: Board, index: number, mark: Mark): Board | null {
  if (
    !Number.isInteger(index)
    || index < 0
    || index >= board.length
    || board[index] !== null
    || getGameResult(board).status !== 'playing'
  ) {
    return null
  }

  // Array.prototype.with preserves the tuple's runtime length, but TypeScript widens it to Cell[].
  return board.with(index, mark) as unknown as Board
}
