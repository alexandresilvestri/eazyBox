import { app } from '../../app'

type Options = {
  headers?: Record<string, string>
  body?: unknown
}

export async function api(
  method: string,
  path: string,
  { headers = {}, body }: Options = {}
) {
  const res = await app.request(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await res.text()
  return {
    status: res.status,
    body: text.length > 0 ? JSON.parse(text) : null,
  }
}
