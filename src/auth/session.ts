import { createHash } from "node:crypto";

import { dataSource } from "../db/data-source.js";
import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export async function getUserFromSession(token: string): Promise<User | null> {
  const [sessionId, secret] = token.split("-");
  const session = await dataSource.getRepository(Session).findOne({
    where: { id: sessionId },
    relations: ["user"],
  });
  if (!session) return null;
  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret === session.secret) return session.user;

  return null;
}
