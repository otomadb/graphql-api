import { PrismaClient, Session, UserRole } from "@prisma/client";
import { parse as parseCookie } from "cookie";
import { createHash, randomBytes } from "crypto";
import { IncomingMessage } from "http";

import { Result } from "../utils/Result.js";

export const OTOMADB_SESSION_COOKIE_NAME = "otmd-session";

export const extractSessionFromReq = (
  req: IncomingMessage
): Result<"NO_COOKIE" | "INVALID_FORM", { id: string; secret: string }> => {
  const cookies = parseCookie(req.headers.cookie || "");
  const sessionCookie = cookies?.[OTOMADB_SESSION_COOKIE_NAME];
  if (!sessionCookie) return { status: "error", error: "NO_COOKIE" };

  const [sessionId, sessionSecret] = sessionCookie.split("-");
  if (!sessionId || !sessionSecret) return { status: "error", error: "INVALID_FORM" };

  return {
    status: "ok",
    data: {
      id: sessionId,
      secret: sessionSecret,
    },
  };
};

export const verifySession = async (
  prisma: PrismaClient,
  { id, secret }: { id: string; secret: string }
): Promise<Result<"NOT_FOUND_SESSION" | "WRONG_SECRET", Session & { user: { id: string; role: UserRole } }>> => {
  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session)
    return {
      status: "error",
      error: "NOT_FOUND_SESSION",
    };

  const hashedSecret = createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== session.secret)
    return {
      status: "error",
      error: "WRONG_SECRET",
    };

  return {
    status: "ok",
    data: session,
  };
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
