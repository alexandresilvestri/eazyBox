export const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const RESET_SUBJECT = 'Redefinir sua senha no EazyBox'

const resetBody = (link: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1a1a1a">
    <p>Recebemos um pedido para redefinir a sua senha.</p>
    <p><a href="${link}" style="color:#ff4d1c">Criar uma nova senha</a></p>
    <p>O link vale por 30 minutos e só pode ser usado uma vez.</p>
    <p>Se não foi você quem pediu, ignore este e-mail.</p>
  </div>
`

export const sendPasswordReset = async (to: string, token: string) => {
  const { RESEND_API_KEY, RESEND_FROM, APP_URL } = process.env
  if (!RESEND_API_KEY || !RESEND_FROM || !APP_URL) {
    throw new Error('RESEND_API_KEY, RESEND_FROM or APP_URL is not set')
  }

  const link = `${APP_URL}/redefinir-senha?token=${encodeURIComponent(token)}`

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to,
      subject: RESET_SUBJECT,
      html: resetBody(link),
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
  }
}
