import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "crypto";

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
