import { useState, useCallback } from 'react'
import GameShell from '../components/GameShell'

// Board layout: row 0 = 3 cells, row 1 = 3 cells, row 2 = 4 cells
// Cell index: row 0 → 0,1,2; row 1 → 3,4,5; row 2 → 6,7,8,9
const ROWS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8, 9],
]

// Map cell index → [row, col]
const CELL_POS: [number, number][] = []
for (let r = 0; r < ROWS.length; r++) {
  for (let c = 0; c < ROWS[r].length; c++) {
    CELL_POS[ROWS[r][c]] = [r, c]
  }
}

// Build reverse: [row][col] → cell index
const POS_TO_IDX: number[][] = [[], [], []]
ROWS.forEach((row, r) => row.forEach((idx, c) => { POS_TO_IDX[r][c] = idx }))

// Compute all valid lines of 3
function computeLines(): number[][] {
  const lines: number[][] = []
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < ROWS[r].length; c++) {
      for (const [dr, dc] of directions) {
        const line: number[] = []
        for (let k = 0; k < 3; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (nr < 0 || nr >= 3) break
          if (nc < 0 || nc >= ROWS[nr].length) break
          line.push(POS_TO_IDX[nr][nc])
        }
        if (line.length === 3) lines.push(line)
      }
    }
  }
  // Deduplicate
  const seen = new Set<string>()
  return lines.filter(l => {
    const key = [...l].sort((a, b) => a - b).join(',')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const WIN_LINES = computeLines()

type Player = 'X' | 'O'
type Cell = Player | null

function checkWinner(board: Cell[]): { winner: Player; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line }
    }
  }
  return null
}

function initialBoard(): Cell[] {
  return Array(10).fill(null)
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(initialBoard)
  const [current, setCurrent] = useState<Player>('X')
  const [winResult, setWinResult] = useState<{ winner: Player; line: number[] } | null>(null)

  const isDraw = !winResult && board.every(c => c !== null)

  const handleClick = (idx: number) => {
    if (board[idx] || winResult || isDraw) return
    const next = board.slice()
    next[idx] = current
    const result = checkWinner(next)
    setBoard(next)
    setWinResult(result)
    if (!result) setCurrent(current === 'X' ? 'O' : 'X')
  }

  const restart = useCallback(() => {
    setBoard(initialBoard())
    setCurrent('X')
    setWinResult(null)
  }, [])

  const winSet = new Set(winResult?.line ?? [])

  function renderRow(indices: number[]) {
    return (
      <div key={indices[0]} className="flex justify-start gap-2">
        {indices.map(idx => {
          const val = board[idx]
          const isWin = winSet.has(idx)
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl font-bold flex items-center justify-center transition-all active:scale-95"
              style={{
                background: isWin
                  ? 'rgba(255, 200, 0, 0.3)'
                  : 'var(--tg-theme-secondary-bg-color)',
                border: isWin
                  ? '2px solid #ffc800'
                  : '2px solid rgba(255,255,255,0.1)',
                color: val === 'X' ? '#ff6b6b' : '#74c0fc',
                boxShadow: isWin ? '0 0 12px #ffc800' : undefined,
              }}
            >
              {val === 'X' ? '✕' : val === 'O' ? '◯' : ''}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <GameShell title="Крестики-нолики" onRestart={restart}>
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        {/* Status */}
        <div
          className="text-base font-medium py-2 px-4 rounded-xl"
          style={{
            background: 'var(--tg-theme-secondary-bg-color)',
            color: winResult
              ? '#ffc800'
              : isDraw
              ? 'var(--tg-theme-hint-color)'
              : 'var(--tg-theme-text-color)',
          }}
        >
          {winResult
            ? `Победил игрок ${winResult.winner === 'X' ? '✕' : '◯'} 🎉`
            : isDraw
            ? 'Ничья!'
            : `Ход игрока: ${current === 'X' ? '✕' : '◯'}`}
        </div>

        {/* Board */}
        <div className="flex flex-col gap-2">
          {ROWS.map(row => renderRow(row))}
        </div>
      </div>
    </GameShell>
  )
}
