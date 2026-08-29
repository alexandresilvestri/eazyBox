import { describe, expect, test } from 'bun:test'
import { RESEND_ENDPOINT, sendPasswordReset } from '../../mail'
import { failNextMail, lastMail, mailbox } from '../helpers/mail'

const withoutEnv = async (name: string, work: () => Promise<void>) => {
  const previous = process.env[name]
  delete process.env[name]
  try {
    await work()
  } finally {
    process.env[name] = previous
  }
}

describe('sendPasswordReset', () => {
  test('posts to the Resend endpoint with the configured sender', async () => {
    await sendPasswordReset('ana@eazybox.test', 'a-token')
    expect(mailbox).toHaveLength(1)
    expect(lastMail().to).toBe('ana@eazybox.test')
    expect(lastMail().from).toBe(String(process.env.RESEND_FROM))
  })

  test('url encodes the token in the link', async () => {
    await sendPasswordReset('ana@eazybox.test', 'a token/with+chars')
    expect(lastMail().html).toContain('a%20token%2Fwith%2Bchars')
    expect(lastMail().html).not.toContain('a token/with+chars')
  })

  test('throws when the api key is missing', async () => {
    await withoutEnv('RESEND_API_KEY', async () => {
      await expect(sendPasswordReset('ana@eazybox.test', 't')).rejects.toThrow(
        'RESEND_API_KEY'
      )
    })
  })

  test('throws when the sender is missing', async () => {
    await withoutEnv('RESEND_FROM', async () => {
      await expect(sendPasswordReset('ana@eazybox.test', 't')).rejects.toThrow(
        'RESEND_FROM'
      )
    })
  })

  test('throws when the app url is missing', async () => {
    await withoutEnv('APP_URL', async () => {
      await expect(sendPasswordReset('ana@eazybox.test', 't')).rejects.toThrow(
        'APP_URL'
      )
    })
  })

  test('throws when Resend answers with a non 2xx', async () => {
    failNextMail(422)
    await expect(sendPasswordReset('ana@eazybox.test', 't')).rejects.toThrow(
      'Resend responded 422'
    )
  })

  test('targets the documented Resend endpoint', () => {
    expect(RESEND_ENDPOINT).toBe('https://api.resend.com/emails')
  })
})
