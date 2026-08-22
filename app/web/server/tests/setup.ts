import { afterEach, beforeAll } from 'bun:test'
import { createTestDatabase, owner, truncateAll } from './helpers/db'

beforeAll(async () => {
  await createTestDatabase()
  await owner.migrate.latest()
})

afterEach(async () => {
  await truncateAll()
})
