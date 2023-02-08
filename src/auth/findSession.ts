import { createHash } from "node:crypto";

import { PrismaClient, Session } from "@prisma/client";

export const findSessionFromCookie = async (prisma: PrismaClient, cookie: string): Promise<Session | null> => {
  const [sessionId, secret] = cookie.split("-");

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== session.secret) return null;

  return session;
};

export const findSessionFromAuthzToken = findSessionFromCookie;
