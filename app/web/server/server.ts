import './sentry'
import { serve } from 'bun'
import { app } from './app'

serve({
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
})
