import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import routes from './routes/index'
import { errorHandler } from './middlewares'
import type { AppEnv } from './context'

const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const app = new Hono<AppEnv>()

app.use('*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: allowedOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)
app.route('/api', routes)
app.onError(errorHandler)
