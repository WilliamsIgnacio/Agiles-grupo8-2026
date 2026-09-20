import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Histodle</h1>} />
      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  )
}

export default App
