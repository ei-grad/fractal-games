import { useState, useCallback } from 'react'
import GameShell from '../components/GameShell'

// Check if a selection of token indices is valid:
// - 1 to 3 tokens
// - all present
// - contiguous in the ORIGINAL circle (removed tokens break adjacency)
function isValidSelection(selected: number[], present: boolean[], n: number): boolean {
  if (selected.length < 1 || selected.length > 3) return false
  if (!selected.every(i => present[i])) return false
  if (selected.length === 1) return true

  const selSet = new Set(selected)

  // Try each token in selected as a potential start, walk clockwise
  for (const start of selected) {
    let valid = true
    let cur = start
    for (let step = 1; step < selected.length; step++) {
      // Walk clockwise skipping removed (but NOT selected-for-removal) tokens
      // Actually per rules: removed tokens break adjacency; we check original positions
      // Contiguous means consecutive original positions that are all present and all selected
      const next = (cur + 1) % n
      if (!selSet.has(next) || !present[next]) {
        valid = false
        break
      }
      cur = next
    }
    if (valid) return true
  }
  return false
}

type Player = 1 | 2

function initPresent(n: number): boolean[] {
  return Array(n).fill(true)
}

const SVG_SIZE = 260
const CENTER = SVG_SIZE / 2
const PETAL_ORBIT = 90   // distance from center to petal center
const PETAL_RX = 14      // half-width of petal ellipse
const PETAL_RY = 30      // half-height of petal ellipse

export default function Romashka() {
  const [tokenCount, setTokenCount] = useState<11 | 12>(11)
  const [present, setPresent] = useState<boolean[]>(() => initPresent(11))
  const [selected, setSelected] = useState<number[]>([])
  const [current, setCurrent] = useState<Player>(1)
  const [winner, setWinner] = useState<Player | null>(null)

  const n = tokenCount
  const remaining = present.filter(Boolean).length

  const restart = useCallback(() => {
    setPresent(initPresent(tokenCount))
    setSelected([])
    setCurrent(1)
    setWinner(null)
  }, [tokenCount])

  const changeCount = (c: 11 | 12) => {
    setTokenCount(c)
    setPresent(initPresent(c))
    setSelected([])
    setCurrent(1)
    setWinner(null)
  }

  const handlePetalClick = (i: number) => {
    if (winner || !present[i]) return

    const idx = selected.indexOf(i)
    let nextSel: number[]

    if (idx >= 0) {
      // Deselect
      nextSel = selected.filter(x => x !== i)
    } else {
      nextSel = [...selected, i]
    }

    // Validate; if invalid, reset to only tapped token (if present)
    if (!isValidSelection(nextSel, present, n)) {
      nextSel = present[i] ? [i] : []
    }

    setSelected(nextSel)
  }

  const handleTake = () => {
    if (selected.length === 0 || winner) return
    const nextPresent = present.slice()
    selected.forEach(i => { nextPresent[i] = false })
    const rem = nextPresent.filter(Boolean).length

    if (rem === 0) {
      // Current player took the last token — they WIN
      setWinner(current)
      setPresent(nextPresent)
      setSelected([])
      return
    }

    setPresent(nextPresent)
    setSelected([])
    setCurrent(current === 1 ? 2 : 1)
  }

  // SVG petal positions
  function petalTransform(i: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const x = CENTER + PETAL_ORBIT * Math.cos(angle)
    const y = CENTER + PETAL_ORBIT * Math.sin(angle)
    const deg = (i / n) * 360
    return { x, y, deg }
  }

  return (
    <GameShell title="Ромашка" onRestart={restart}>
      <div
        className="flex flex-col items-center justify-center h-full gap-3 px-4"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        {/* Count toggle */}
        <div
          className="flex gap-2 rounded-xl p-1"
          style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        >
          {([11, 12] as const).map(c => (
            <button
              key={c}
              onClick={() => changeCount(c)}
              className="px-4 py-1 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tokenCount === c ? 'var(--tg-theme-button-color)' : 'transparent',
                color: tokenCount === c ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-hint-color)',
              }}
            >
              {c} фишек
            </button>
          ))}
        </div>

        {/* Status */}
        <div
          className="text-sm font-medium py-1 px-3 rounded-lg"
          style={{
            background: 'var(--tg-theme-secondary-bg-color)',
            color: winner ? '#ffc800' : 'var(--tg-theme-text-color)',
          }}
        >
          {winner
            ? `Игрок ${winner} победил! 🎉`
            : `Ход игрока ${current} · Осталось: ${remaining}`}
        </div>

        {/* SVG Board */}
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="overflow-visible"
        >
          {/* Petals */}
          {Array.from({ length: n }, (_, i) => {
            const { x, y, deg } = petalTransform(i)
            const isSel = selected.includes(i)
            const isPresent = present[i]

            if (!isPresent) {
              // Ghost petal
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx={PETAL_RX}
                  ry={PETAL_RY}
                  transform={`rotate(${deg}, ${x}, ${y})`}
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )
            }

            return (
              <g key={i} onClick={() => handlePetalClick(i)} style={{ cursor: 'pointer' }}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx={PETAL_RX}
                  ry={PETAL_RY}
                  transform={`rotate(${deg}, ${x}, ${y})`}
                  fill={isSel ? 'rgba(255,200,0,0.55)' : 'rgba(100,180,255,0.25)'}
                  stroke={isSel ? '#ffc800' : 'rgba(100,180,255,0.6)'}
                  strokeWidth={isSel ? '2' : '1.5'}
                  style={{ filter: isSel ? 'drop-shadow(0 0 6px #ffc800)' : undefined }}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="bold"
                  fill={isSel ? '#ffc800' : 'var(--tg-theme-text-color)'}
                >
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* Center circle */}
          <circle cx={CENTER} cy={CENTER} r={28} fill="var(--tg-theme-secondary-bg-color)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <text
            x={CENTER}
            y={CENTER - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="22"
            fontWeight="bold"
            fill="var(--tg-theme-text-color)"
          >
            {remaining}
          </text>
          <text
            x={CENTER}
            y={CENTER + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fill="var(--tg-theme-hint-color)"
          >
            осталось
          </text>
        </svg>

        {/* Take button */}
        <button
          onClick={handleTake}
          disabled={selected.length === 0 || !!winner}
          className="px-8 py-3 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: selected.length > 0 && !winner ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
            color: 'var(--tg-theme-button-text-color)',
          }}
        >
          {selected.length > 0 ? `Забрать (${selected.length})` : 'Выберите фишки'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
          Выберите 1–3 соседних фишки. Забравший последнюю побеждает.
        </p>
      </div>
    </GameShell>
  )
}
