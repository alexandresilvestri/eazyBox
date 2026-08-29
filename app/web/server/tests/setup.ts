import { afterEach, beforeAll } from 'bun:test'
import {
  clearCache,
  createTestDatabase,
  owner,
  truncateAll,
} from './helpers/db'
import { clearMailbox, stubMail } from './helpers/mail'

stubMail()

beforeAll(async () => {
  await createTestDatabase()
  await owner.migrate.latest()
})

afterEach(async () => {
  await truncateAll()
  await clearCache()
  clearMailbox()
})
