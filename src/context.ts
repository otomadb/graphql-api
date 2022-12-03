import { type User } from "./db/entities/users.js";

export type Context = { user: User | null };
