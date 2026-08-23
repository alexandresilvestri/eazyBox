import { afterEach, beforeAll } from 'bun:test'
import { createTestDatabase, owner, truncateAll } from './helpers/db'
import { invalidate } from '../redis'
import { CACHE_PREFIXES } from '../services/constants'

beforeAll(async () => {
  await createTestDatabase()
  await owner.migrate.latest()
})

afterEach(async () => {
  await truncateAll()
  await Promise.all(CACHE_PREFIXES.map(invalidate))
})
