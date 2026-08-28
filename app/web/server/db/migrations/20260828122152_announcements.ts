import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('announcements', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.text('body').notNullable()
    t.uuid('author_id').references('id').inTable('users').onDelete('SET NULL')
    t.timestamps(true, true)
    t.timestamp('deleted_at', { useTz: true })
    t.index('created_at')
  })

  await knex.raw('alter table announcements enable row level security')
  await knex.raw(`
    create policy announcements_select on announcements for select
      using (app.is_authenticated())
  `)
  await knex.raw(`
    create policy announcements_write on announcements for all
      using (app.is_staff())
      with check (app.is_staff())
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('announcements')
}
