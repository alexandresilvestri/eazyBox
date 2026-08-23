import { Sentry } from './sentry'
import { serve } from 'bun'
import index from '../client/index.html'
import { app } from './app'

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
