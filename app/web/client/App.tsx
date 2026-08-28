import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { AuthProvider, useAuth } from '@/auth-context'
import { Shell } from '@/components/layout/Shell'
import Ajustes from '@/pages/Ajustes'
import Aulas from '@/pages/Aulas'
import Checkins from '@/pages/Checkins'
import Clientes from '@/pages/Clientes'
import Coaches from '@/pages/Coaches'
import Dashboard from '@/pages/Dashboard'
import Entrar from '@/pages/Entrar'
import Horarios from '@/pages/Horarios'
import Wods from '@/pages/Wods'

function RequireAdmin() {
  const { user } = useAuth()
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/entrar" element={<Entrar />} />
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="wods" element={<Wods />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="aulas" element={<Aulas />} />
            <Route element={<RequireAdmin />}>
              <Route path="clientes" element={<Clientes />} />
              <Route path="coaches" element={<Coaches />} />
            </Route>
            <Route path="check-ins" element={<Checkins />} />
            <Route path="ajustes" element={<Ajustes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
