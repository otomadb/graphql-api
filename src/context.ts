import { type User } from "./db/entities/users.js";

export type ContextUser = User;
export type Context = { user: ContextUser | null };
