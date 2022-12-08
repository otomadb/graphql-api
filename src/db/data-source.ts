import { dirname } from "path";
import { DataSource } from "typeorm";

import { entities } from "./entities/index.js";

export const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: [`${dirname(new URL(import.meta.url).pathname)}/migrations/*.ts`],
});
