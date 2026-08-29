import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { CHECKIN_WINDOW_HOURS, DEFAULT_CAPACITY } from '@eazybox/shared'
import { useAuth } from '@/auth-context'
import { Button } from '@/components/ui/button'
import { FloatingField } from '@/components/ui-x/FloatingField'
import { Mark } from '@/components/ui-x/Mark'

const HIGHLIGHTS = [
  { value: String(DEFAULT_CAPACITY), detail: 'vagas por aula (padrão)' },
  { value: `${CHECKIN_WINDOW_HOURS}h`, detail: 'janela de check-in' },
  { value: '7', detail: 'dias de grade fixa' },
]

export default function Entrar() {
  const { user, loading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <section className="flex flex-1 flex-col justify-between gap-10 border-b border-hairline px-6 py-10 lg:gap-14 lg:border-r lg:border-b-0 lg:px-16 lg:py-14">
        <div className="flex items-center gap-3.5">
          <Mark className="size-11" />
          <span className="font-display text-xl tracking-heading">EazyBox</span>
        </div>

        <div className="max-w-xl">
          <p className="eyebrow">Painel de gestão</p>
          <h1 className="mt-3.5 font-display text-display-sm tracking-display lg:text-display">
            App de check-in
            <br />
            para box de crossfit
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-2">
            Gerencie WODs, aulas, horários e alunos. O aluno faz check-in pelo
            app. Fácil e prático,
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-5">
          {HIGHLIGHTS.map((item) => (
            <div key={item.detail}>
              <p className="text-heading font-bold tracking-heading">
                {item.value}
              </p>
              <p className="mt-0.5 text-sm text-ink-3">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <form
        onSubmit={submit}
        className="flex w-full shrink-0 flex-col justify-center gap-7 px-6 py-10 lg:w-[520px] lg:px-16 lg:py-0"
      >
        <div>
          <h2 className="text-xl font-bold">Entrar no painel</h2>
          <p className="mt-2 text-lg text-ink-2">
            Acesso para administradores e coaches.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <FloatingField
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FloatingField
            label="Senha"
            type={reveal ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            reveal={reveal}
            onToggleReveal={() => setReveal((current) => !current)}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-base text-accent-text">{error}</p> : null}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || !email || !password}
        >
          Entrar
        </Button>

        <div className="flex items-center justify-between gap-3">
          <span className="text-base text-ink-3">
            Sessão renovada automaticamente.
          </span>
          <Link
            to="/esqueci-senha"
            className="text-base font-semibold text-ink-1 underline decoration-hairline-strong"
          >
            Esqueci a senha
          </Link>
        </div>
      </form>
    </div>
  )
}
