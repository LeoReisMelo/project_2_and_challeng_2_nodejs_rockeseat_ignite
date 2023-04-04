import fastify from 'fastify'
import { snacksRoutes } from './routes/snacks'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (request, reply) => {
  console.log(`[${request.method}] ${request.url}`)
})

app.register(snacksRoutes, {
  prefix: 'snacks',
})

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(authRoutes, {
  prefix: 'auth',
})
