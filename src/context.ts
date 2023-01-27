import { User } from "@prisma/client";

export type ContextUser = User;
export type Context = { user: ContextUser | null };
