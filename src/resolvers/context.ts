import { User } from "@prisma/client";

export type ContextUserId = User["id"];

export type Context = { userId: ContextUserId | null };
