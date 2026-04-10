import { HashRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import TicTacToe from './games/TicTacToe'
import Romashka from './games/Romashka'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/romashka" element={<Romashka />} />
      </Routes>
    </HashRouter>
  )
}
