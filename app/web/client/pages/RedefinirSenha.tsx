import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { resetPasswordSchema } from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import { FloatingField } from '@/components/ui-x/FloatingField'
import { Mark } from '@/components/ui-x/Mark'
import { apiFetch } from '@/lib/api'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [reveal, setReveal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!token) return <Navigate to="/esqueci-senha" replace />

  const valid =
    resetPasswordSchema.safeParse({ token, password }).success &&
    password === confirmation

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      navigate('/entrar', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível salvar a senha'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 py-10">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-7">
        <Mark className="size-11" />

        <div>
          <h1 className="font-display text-heading tracking-heading">
            Nova senha
          </h1>
          <p className="mt-3 text-lg text-ink-2">
            Use pelo menos 8 caracteres. O link só pode ser usado uma vez.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <FloatingField
            label="Nova senha"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            reveal={reveal}
            onToggleReveal={() => setReveal((current) => !current)}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FloatingField
            label="Confirmar senha"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {confirmation && password !== confirmation ? (
            <p className="text-base text-accent-text">As senhas não conferem</p>
          ) : null}
          {error ? <p className="text-base text-accent-text">{error}</p> : null}
        </div>

        <Button type="submit" size="lg" disabled={submitting || !valid}>
          Salvar senha
        </Button>

        <Link
          to="/entrar"
          className="text-base font-semibold text-ink-1 underline decoration-hairline-strong"
        >
          Voltar para o login
        </Link>
      </form>
    </main>
  )
}
