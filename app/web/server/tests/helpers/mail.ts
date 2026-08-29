import { RESEND_ENDPOINT } from '../../mail'

export type SentMail = {
  from: string
  to: string
  subject: string
  html: string
}

export const mailbox: SentMail[] = []

export const lastMail = (): SentMail => {
  const sent = mailbox.at(-1)
  if (sent === undefined) {
    throw new Error('no mail was sent')
  }
  return sent
}

let nextStatus = 200

export const failNextMail = (status = 422) => {
  nextStatus = status
}

export const clearMailbox = () => {
  mailbox.length = 0
  nextStatus = 200
}

export const stubMail = () => {
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    if (url !== RESEND_ENDPOINT) {
      return realFetch(input, init)
    }
    mailbox.push(JSON.parse(String(init?.body)))
    const status = nextStatus
    nextStatus = 200
    return new Response('{"id":"stub"}', { status })
  }) as typeof fetch
}
