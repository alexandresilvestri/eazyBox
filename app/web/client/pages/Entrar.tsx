import { useState, type FormEvent } from 'react'
import { useAuth } from '@/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineAlert } from '@/components/ui-x/InlineAlert'

export function Entrar() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div
        className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-hairline bg-surface p-7"
        data-testid="login-card"
      >
        <div>
          <h1 className="display-numeral text-3xl text-ink-1">EAZYBOX</h1>
          <p className="eyebrow mt-1">Console do box</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              data-testid="login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              data-testid="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <InlineAlert data-testid="login-error">{error}</InlineAlert>
          )}

          <Button
            type="submit"
            size="lg"
            data-testid="login-submit"
            disabled={submitting}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  )
}
