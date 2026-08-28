import { cached, invalidate } from '../redis'
import { AnnouncementNotFound } from '../errors'
import { CACHE_PREFIX, LIST_TTL_SECONDS } from './constants'
import type { AnnouncementModel } from '../models/announcement'
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@eazybox/shared'

const PREFIX = CACHE_PREFIX.announcements

export class AnnouncementsService {
  constructor(private readonly announcements: AnnouncementModel) {}

  list() {
    return cached(
      `${PREFIX}list`,
      () => this.announcements.findAll(),
      LIST_TTL_SECONDS
    )
  }

  async create(authorId: string, input: CreateAnnouncementInput) {
    const announcement = await this.announcements.insert({ ...input, authorId })
    await invalidate(PREFIX)
    return announcement
  }

  async update(id: string, input: UpdateAnnouncementInput) {
    const announcement = await this.announcements.update(id, input)
    if (!announcement) {
      throw new AnnouncementNotFound()
    }
    await invalidate(PREFIX)
    return announcement
  }

  async remove(id: string) {
    const deleted = await this.announcements.softDelete(id)
    if (!deleted) {
      throw new AnnouncementNotFound()
    }
    await invalidate(PREFIX)
  }
}
