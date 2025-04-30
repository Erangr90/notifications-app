import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

export const kdb = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
});
