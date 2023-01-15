import { createHash, randomBytes } from "crypto";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export const createSession = async (ds: DataSource, user: User) => {
  const id = ulid();
  const secret = randomBytes(32).toString("hex");

  const session = new Session();
  session.id = id;
  session.user = user;
  session.secret = createHash("sha256").update(secret).digest("hex");
  session.expiredAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 /* 10 days */);

  await ds.getRepository(Session).insert(session);
  return `${id}-${secret}`;
};
