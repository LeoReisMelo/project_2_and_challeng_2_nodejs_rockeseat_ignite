// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    snacks: {
      id: string
      name: string
      description: string
      date: string
      hour: string
      isOnDiet: boolean
      created_at: string
      updated_at: string
      session_id?: string
    }
  }
}
