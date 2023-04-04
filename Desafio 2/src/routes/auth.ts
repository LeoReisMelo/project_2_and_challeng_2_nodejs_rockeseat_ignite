import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { AES, enc } from 'crypto-js'
import { env } from '../env'

export async function authRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })
    const { email, password } = createUserBodySchema.parse(request.body)
    const user = await knex('users').where({ email }).first()

    const unhashedPassword = AES.decrypt(
      user.password,
      env.ENCRYPT_KEY,
    ).toString(enc.Utf8)

    if (unhashedPassword !== password) {
      return reply.status(401).send('Invalid email or password')
    }

    reply.cookie('sessionId', user.id, {
      path: '/',
    })

    return reply.status(201).send()
  })
}
