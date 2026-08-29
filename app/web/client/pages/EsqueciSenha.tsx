import { useState } from 'react'
import { Link } from 'react-router'
import { forgotPasswordSchema } from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import { FloatingField } from '@/components/ui-x/FloatingField'
import { Mark } from '@/components/ui-x/Mark'
import { apiFetch } from '@/lib/api'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível enviar o link'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 py-10">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-7">
        <Mark className="size-11" />

        <h1 className="font-display text-heading tracking-heading">
          Esqueci a senha
        </h1>

        {sent ? (
          <p className="text-lg text-ink-2">
            Se existe uma conta com esse e-mail, enviamos um link para criar uma
            senha nova. Ele vale por 30 minutos.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <p className="text-lg text-ink-2">
                Informe o e-mail cadastrado na box e enviamos um link para você
                criar uma senha nova.
              </p>
              <FloatingField
                label="E-mail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {error ? (
                <p className="text-base text-accent-text">{error}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={
                submitting ||
                !forgotPasswordSchema.safeParse({ email: email.trim() }).success
              }
            >
              Enviar link
            </Button>
          </>
        )}

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
