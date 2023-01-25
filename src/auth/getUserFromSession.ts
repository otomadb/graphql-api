import { createHash } from "node:crypto";

import { PrismaClient, User } from "@prisma/client";

export const findUserFromCookie = async (prisma: PrismaClient, cookie: string): Promise<User | null> => {
  const [sessionId, secret] = cookie.split("-");

  const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } });
  if (!session) return null;

  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== session.secret) return null;

  return session.user;
};

export const findUserFromAuthToken = findUserFromCookie;
