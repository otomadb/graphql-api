import { createHash } from "node:crypto";

import { DataSource } from "typeorm";

import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export const findUserFromCookie =
  ({ dataSource }: { dataSource: DataSource }) =>
  async (cookie: string): Promise<User | null> => {
    const [sessionId, secret] = cookie.split("-");

    const session = await dataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ["user"],
    });
    if (!session) return null;

    const hashedSecret = createHash("sha256").update(secret).digest("hex");
    if (hashedSecret !== session.secret) return null;

    return session.user;
  };

export const findUserFromAuthToken = findUserFromCookie;
