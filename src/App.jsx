import { useState, useEffect } from 'react'
import { seedIfEmpty } from './utils/storage'
import LandingPage from './pages/LandingPage'
import ReservarPage from './pages/ReservarPage'
import ConfirmacionPage from './pages/ConfirmacionPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  const [page, setPage] = useState('landing')
  const [reservaData, setReservaData] = useState(null)

  useEffect(() => { seedIfEmpty() }, [])

  const navigate = (p, data = null) => {
    setPage(p)
    if (data) setReservaData(data)
    window.scrollTo(0, 0)
  }

  switch (page) {
    case 'reservar':     return <ReservarPage navigate={navigate} />
    case 'confirmacion': return <ConfirmacionPage navigate={navigate} reserva={reservaData} />
    case 'admin':        return <AdminPage navigate={navigate} />
    default:             return <LandingPage navigate={navigate} />
  }
}
