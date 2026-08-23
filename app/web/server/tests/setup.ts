import { afterEach, beforeAll } from 'bun:test'
import {
  clearCache,
  createTestDatabase,
  owner,
  truncateAll,
} from './helpers/db'

beforeAll(async () => {
  await createTestDatabase()
  await owner.migrate.latest()
})

afterEach(async () => {
  await truncateAll()
  await clearCache()
})
