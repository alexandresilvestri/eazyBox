import Knex from "knex";
import knexfile from "../knexfile";
import { config as knexConfig } from './knex.config.js'

const environment = process.env.NODE_ENV ?? "development";
const config = knexfile[environment];

export const db = Knex({ ...config, ...knexConfig });
