import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider, useAuth } from '@/auth-context'
import { ConsoleShell } from '@/components/layout/ConsoleShell'
import { Entrar } from '@/pages/Entrar'
import { Grade } from '@/pages/Grade'
import { Membros } from '@/pages/Membros'
import { Painel } from '@/pages/Painel'
import { Programacao } from '@/pages/Programacao'
import { Sessoes } from '@/pages/Sessoes'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center"
        data-testid="loading"
      >
        <p className="text-xs text-ink-2">Carregando...</p>
      </main>
    )
  }

  if (!user) return <Entrar />

  return (
    <Routes>
      <Route element={<ConsoleShell />}>
        <Route index element={<Painel />} />
        <Route path="programacao" element={<Programacao />} />
        <Route path="grade" element={<Grade />} />
        <Route path="sessoes" element={<Sessoes />} />
        <Route path="membros" element={<Membros />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  )
}
