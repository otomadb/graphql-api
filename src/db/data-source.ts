import { dirname } from "path";
import { DataSource } from "typeorm";

import { entities } from "./entities/index.js";

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities,
  migrations: [`${dirname(new URL(import.meta.url).pathname)}/migrations/*.ts`],
});
