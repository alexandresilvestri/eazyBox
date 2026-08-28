import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth-context'
import { BoxProvider } from '@/box-context'
import { TopBar } from '@/components/layout/TopBar'
import { Mark } from '@/components/ui-x/Mark'

export function Shell() {
  const { user, loading, logout } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/entrar" replace />

  if (!user.isAdmin && !user.isCoach) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="flex max-w-md flex-col items-start gap-5">
          <Mark className="size-11" />
          <h1 className="font-display text-heading tracking-heading">
            Este painel é da equipe
          </h1>
          <p className="text-lg text-ink-2">
            Sua conta é de aluno. Use o aplicativo EazyBox para ver o WOD e
            fazer check-in.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-base font-semibold text-ink-1 underline decoration-hairline-strong"
          >
            Sair da conta
          </button>
        </div>
      </main>
    )
  }

  return (
    <BoxProvider>
      <div className="flex h-dvh flex-col bg-surface">
        <TopBar user={user} onLogout={() => void logout()} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-7">
          <Outlet />
        </main>
      </div>
    </BoxProvider>
  )
}
