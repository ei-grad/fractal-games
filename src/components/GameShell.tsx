import { useNavigate } from 'react-router-dom'

interface GameShellProps {
  title: string
  onRestart: () => void
  children: React.ReactNode
}

export default function GameShell({ title, onRestart, children }: GameShellProps) {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--tg-theme-bg-color)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: 'var(--tg-theme-secondary-bg-color)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-sm px-3 py-1 rounded-lg transition-opacity active:opacity-60"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'var(--tg-theme-text-color)',
          }}
        >
          ← Назад
        </button>
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          {title}
        </span>
        <button
          onClick={onRestart}
          className="text-sm px-3 py-1 rounded-lg transition-opacity active:opacity-60"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'var(--tg-theme-text-color)',
          }}
        >
          ↺ Заново
        </button>
      </div>

      {/* Game area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
