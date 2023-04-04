import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { Snack } from '../interfaces/Snack'

export async function snacksRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const snacks = await knex('snacks')
        .where('session_id', sessionId)
        .select()

      return {
        snacks,
      }
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getSnacksParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getSnacksParamsSchema.parse(request.params)
    const { sessionId } = request.cookies
    const snack = await knex('snacks')
      .where({ id, session_id: sessionId })
      .first()

    return { snack }
  })

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies
      const snacks = await knex('snacks')
        .where('session_id', sessionId)
        .select()
      const snacksOnDiet = []
      const snacksOutDiet = []
      const bestSequel: Array<Snack> = []

      snacks.forEach((snack) => {
        if (Number(snack.isOnDiet) !== 1) {
          snacksOutDiet.push(snack)
          bestSequel.splice(0, bestSequel.length)
        } else {
          snacksOnDiet.push(snack)
          bestSequel.push(snack)
        }
      })

      const metrics = {
        snacks: snacks.length,
        snacksOnDiet: snacksOnDiet.length,
        snacksOutDiet: snacksOutDiet.length,
        percentageOnDiet: `${(
          (snacksOnDiet.length / snacks.length) *
          100
        ).toFixed(2)}%`,
        bestSequel: bestSequel.length,
      }

      return { metrics }
    },
  )

  app.post('/', async (request, reply) => {
    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      isOnDiet: z.boolean(),
    })
    const { name, description, date, hour, isOnDiet } =
      createSnackBodySchema.parse(request.body)

    const sessionId = request.cookies.sessionId

    await knex('snacks').insert({
      id: crypto.randomUUID(),
      name,
      description,
      date,
      hour,
      isOnDiet,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getSnacksParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const updateSnackBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        hour: z.string().optional(),
        isOnDiet: z.boolean().optional(),
      })
      const data = updateSnackBodySchema.parse(request.body)

      const { id } = getSnacksParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      await knex('snacks').where({ id, session_id: sessionId }).update(data)

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getSnacksParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getSnacksParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      await knex('snacks').where({ id, session_id: sessionId }).delete()

      return reply.status(204).send()
    },
  )
}
