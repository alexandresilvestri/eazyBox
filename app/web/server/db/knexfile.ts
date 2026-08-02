import type { Knex } from "knex";

const baseConfig: Knex.Config = {
  client: "pg",
  migrations: {
    directory: "./migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./seeds",
    extension: "ts",
  },
};

const config: Record<string, Knex.Config> = {
  development: {
    ...baseConfig,
    connection:
      process.env.DATABASE_URL ??
      {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER ?? "postgres",
        database: process.env.DB_NAME ?? "eazybox",
      },
    pool: { min: 1, max: 10 },
  },
  production: {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 20 },
  },
};

export default config;
