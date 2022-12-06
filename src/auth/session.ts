import { createHash } from "node:crypto";

import { dataSource } from "~/db/data-source.js";
import { Session } from "~/db/entities/sessions.js";
import { User } from "~/db/entities/users.js";

export async function getUserFromSession(cookieValue: string | undefined): Promise<User | null> {
  if (!cookieValue) return null;
  const [sessionId, secret] = cookieValue.split("-");
  const session = await dataSource.getRepository(Session).findOne({
    where: {
      id: sessionId,
    },
    relations: ["user"],
  });
  if (!session) return null; // TODO: clear session cookie
  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret === session.secret) return session.user;
  // TODO: clear session cookie
  return null;
}
