export type Mark = 'X' | 'O'
export type Cell = Mark | null

export type Board = readonly [
  Cell, Cell, Cell,
  Cell, Cell, Cell,
  Cell, Cell, Cell
]

export type WinningLine = readonly [number, number, number]
export type Difficulty = 'easy' | 'hard'
export type GamePhase = 'human-turn' | 'computer-turn' | 'finished'

export type GameResult
  = | { status: 'playing' }
    | { status: 'draw' }
    | { status: 'won', winner: Mark, line: WinningLine }
