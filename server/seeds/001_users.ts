import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();
  await knex("users").insert([
    { name: "Ana Souza", email: "ana@example.com" },
    { name: "Bruno Lima", email: "bruno@example.com" },
  ]);
}
