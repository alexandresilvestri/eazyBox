import { Sentry } from './sentry'
import { serve } from 'bun'
import index from '../client/index.html'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'
import routes from './routes/index'

const app = new Hono()
app.use('*', secureHeaders())
app.route('/api', routes)

app.onError((err, c) => {
  Sentry.captureException(err)
  return c.json({ error: 'Erro interno do servidor' }, 500)
})

serve({
  port: Number(process.env.PORT ?? 3000),
  development: process.env.NODE_ENV === 'development' && {
    hmr: true,
    console: true,
  },

  routes: {
    '/api/*': app.fetch,
    '/*': index,
  },

  error(error) {
    Sentry.captureException(error)
    return new Response('Internal Server Error', { status: 500 })
  },
})
