import Knex from "knex";
import knexConfig from "../knexfile";

const environment = process.env.NODE_ENV ?? "development";
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Nenhuma configuração do Knex encontrada para o ambiente "${environment}"`);
}

export const db = Knex(config);
