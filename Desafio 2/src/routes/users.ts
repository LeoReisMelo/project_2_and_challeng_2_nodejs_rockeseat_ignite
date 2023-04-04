import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'
import { knex } from '../database'
import { AES } from 'crypto-js'
import { env } from '../env'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })
    const { name, email, password } = createUserBodySchema.parse(request.body)
    const hashedPassword = AES.encrypt(password, env.ENCRYPT_KEY).toString()

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    return reply.status(201).send()
  })
}
