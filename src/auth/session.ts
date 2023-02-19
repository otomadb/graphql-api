import { PrismaClient, Session, UserRole } from "@prisma/client";
import { parse as parseCookie } from "cookie";
import { createHash, randomBytes } from "crypto";
import { IncomingMessage } from "http";

import { err, ok, Result } from "../utils/Result.js";

export const extractSessionFromReq = (
  req: IncomingMessage,
  cookieName: string
): Result<{ type: "NO_COOKIE" } | { type: "INVALID_FORM"; cookie: string }, { id: string; secret: string }> => {
  const cookies = parseCookie(req.headers.cookie || "");
  const sessionCookie = cookies?.[cookieName];
  if (!sessionCookie) return err({ type: "NO_COOKIE" });

  const [sessionId, sessionSecret] = sessionCookie.split("-");
  if (!sessionId || !sessionSecret) return err({ type: "INVALID_FORM", cookie: sessionCookie });

  return ok({ id: sessionId, secret: sessionSecret });
};

export const verifySession = async (
  prisma: PrismaClient,
  { id, secret }: { id: string; secret: string }
): Promise<
  Result<
    { type: "NOT_FOUND_SESSION"; id: string; secret: string } | { type: "WRONG_SECRET"; id: string; secret: string },
    Session & { user: { id: string; role: UserRole } }
  >
> => {
  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session) return err({ type: "NOT_FOUND_SESSION", id, secret });

  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== session.secret) return err({ type: "WRONG_SECRET", id, secret });

  return ok(session);
};

export const createSession = async (prisma: PrismaClient, userId: string) => {
  const secret = randomBytes(32).toString("hex");

  const { id } = await prisma.session.create({
    data: {
      userId,
      secret: createHash("sha256").update(secret).digest("hex"),
      expiredAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 /* 10 days */),
    },
  });
  return `${id}-${secret}`;
};
