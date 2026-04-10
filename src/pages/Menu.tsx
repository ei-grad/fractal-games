import { useNavigate } from 'react-router-dom'

const games = [
  {
    path: '/tictactoe',
    title: 'Крестики-нолики 3·3·4',
    desc: 'Нестандартное поле — 10 клеток, 3 в ряд. Два игрока на одном экране.',
    emoji: '✕○',
  },
  {
    path: '/romashka',
    title: 'Ромашка',
    desc: 'Круговой ним — 11 или 12 фишек в круге. Забери последнюю!',
    emoji: '🌼',
  },
]

export default function Menu() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-5 px-4"
      style={{ background: 'var(--tg-theme-bg-color)' }}
    >
      <h1
        className="text-2xl font-bold tracking-tight mb-2"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        Игры на двоих
      </h1>

      {games.map((g) => (
        <button
          key={g.path}
          onClick={() => navigate(g.path)}
          className="w-full max-w-sm rounded-2xl p-5 text-left transition-transform active:scale-95"
          style={{
            background: 'var(--tg-theme-secondary-bg-color)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-3xl mb-2">{g.emoji}</div>
          <div
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            {g.title}
          </div>
          <div className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {g.desc}
          </div>
        </button>
      ))}
    </div>
  )
}
