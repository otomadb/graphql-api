import { dirname, resolve } from "path";

export const migrations = [`${(resolve(dirname(new URL(import.meta.url).pathname)), "./migrations")}/*.ts`];
