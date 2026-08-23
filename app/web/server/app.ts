import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import routes from './routes/index'
import { errorHandler } from './middlewares'
import type { AppEnv } from './context'

export const app = new Hono<AppEnv>()

app.use('*', secureHeaders())
app.route('/api', routes)
app.onError(errorHandler)
