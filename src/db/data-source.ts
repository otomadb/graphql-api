import { dirname } from "node:path";
import { DataSource } from "typeorm";
import { Session } from "./entities/sessions.js";
import { User } from "./entities/users.js";

const dir = dirname(new URL(import.meta.url).pathname);

export const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, Session],
  migrations: [`${dir}/migrations/*.ts`, `${dir}/migrations/*.js`],
});
