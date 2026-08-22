import { AuthProvider, useAuth } from '@/auth-context'
import { Dashboard } from '@/components/dashboard'
import { LoginForm } from '@/components/login-form'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        data-testid="loading"
      >
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
