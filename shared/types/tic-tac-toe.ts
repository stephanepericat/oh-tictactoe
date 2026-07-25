export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Board = readonly [
  Cell, Cell, Cell,
  Cell, Cell, Cell,
  Cell, Cell, Cell
]

export type WinningLine = readonly [BoardIndex, BoardIndex, BoardIndex]
export type Difficulty = 'easy' | 'hard'
export type GamePhase = 'human-turn' | 'computer-turn' | 'finished'

export type SessionScore = Readonly<{
  human: number
  computer: number
  draws: number
}>

export type GameResult
  = | { status: 'playing' }
    | { status: 'draw' }
    | { status: 'won', winner: Mark, line: WinningLine }
