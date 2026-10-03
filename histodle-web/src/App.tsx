import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar';
import { Admin } from './pages/Admin/Admin';
import { Jugar } from './pages/Jugar/Jugar';
import './App.css';

function App() {
  return (
    <div className='app-layout'>
      <Navbar />
      <Routes>
        <Route path="/" element={<Jugar />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
    </div>
  )
}

export default App
