import type { Board, Mark } from '../types/tic-tac-toe'
import { getGameResult, getLegalMoves, placeMark } from './tic-tac-toe'

type RandomSource = () => number

const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7] as const

function getOrderedLegalMoves(board: Board): number[] {
  const legalMoves = new Set(getLegalMoves(board))
  return MOVE_ORDER.filter(move => legalMoves.has(move))
}

export function chooseEasyMove(
  board: Board,
  computerMark: Mark,
  random: RandomSource = Math.random
): number | null {
  const legalMoves = getLegalMoves(board)

  if (legalMoves.length === 0) {
    return null
  }

  const immediateWin = legalMoves.find((move) => {
    const nextBoard = placeMark(board, move, computerMark)
    return nextBoard && getGameResult(nextBoard).status === 'won'
  })

  if (immediateWin !== undefined) {
    return immediateWin
  }

  const randomIndex = Math.min(
    Math.floor(Math.max(0, random()) * legalMoves.length),
    legalMoves.length - 1
  )

  return legalMoves[randomIndex] ?? null
}

export function chooseHardMove(
  board: Board,
  computerMark: Mark,
  humanMark: Mark
): number | null {
  const legalMoves = getOrderedLegalMoves(board)

  if (legalMoves.length === 0) {
    return null
  }

  let bestMove = legalMoves[0] ?? null
  let bestScore = Number.NEGATIVE_INFINITY

  for (const move of legalMoves) {
    const nextBoard = placeMark(board, move, computerMark)

    if (!nextBoard) {
      continue
    }

    const score = minimax(nextBoard, humanMark, computerMark, humanMark, 1)

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function minimax(
  board: Board,
  currentMark: Mark,
  computerMark: Mark,
  humanMark: Mark,
  depth: number
): number {
  const result = getGameResult(board)

  if (result.status === 'won') {
    return result.winner === computerMark ? 10 - depth : depth - 10
  }

  if (result.status === 'draw') {
    return 0
  }

  const scores = getOrderedLegalMoves(board).map((move) => {
    const nextBoard = placeMark(board, move, currentMark)

    if (!nextBoard) {
      return currentMark === computerMark
        ? Number.NEGATIVE_INFINITY
        : Number.POSITIVE_INFINITY
    }

    const nextMark = currentMark === computerMark ? humanMark : computerMark
    return minimax(nextBoard, nextMark, computerMark, humanMark, depth + 1)
  })

  return currentMark === computerMark
    ? Math.max(...scores)
    : Math.min(...scores)
}
