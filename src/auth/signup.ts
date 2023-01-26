import { MylistShareRange, PrismaClient, User, UserRole } from "@prisma/client";
import * as argon2 from "argon2";
import { RouteHandlerMethod } from "fastify";
import { z } from "zod";

import { Result } from "../utils/Result.js";
import { createSession } from "./createSession.js";

const reqBodySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  email: z.string(),
  password: z.string(),
});

export const registerUser = async (
  prisma: PrismaClient,
  input: z.infer<typeof reqBodySchema>
): Promise<Result<{ message: "USER_NAME_ALREADY_REGISTERED" }, { user: User }>> => {
  const { name, displayName, email, password: rawPassword } = input;

  if (await prisma.user.findUnique({ where: { name } }))
    return {
      status: "error",
      error: { message: "USER_NAME_ALREADY_REGISTERED" },
    };

  const isExistAdmin = !!(await prisma.user.findFirst({ where: { role: UserRole.ADMINISTRATOR } }));

  const hashedPassword = await argon2.hash(rawPassword, {
    type: 2,
    memoryCost: 15 * 1024,
    timeCost: 2,
    parallelism: 1,
  });

  const user = await prisma.user.create({
    data: {
      name,
      displayName,
      email,
      password: hashedPassword,
      icon: null,
      isEmailConfirmed: true, // TODO: fix
      role: isExistAdmin ? UserRole.NORMAL : UserRole.ADMINISTRATOR,
      mylists: {
        create: {
          isLikeList: true,
          title: `Favlist for ${name}`,
          shareRange: MylistShareRange.PRIVATE,
        },
      },
    },
  });

  return { status: "ok", data: { user } };
};

export const handlerSignup = (prisma: PrismaClient) =>
  (async (req, reply) => {
    const parsedReqBody = reqBodySchema.safeParse(req.body);

    if (!parsedReqBody.success) return reply.status(400).send({ code: "INVALID_REQUEST" });

    const result = await registerUser(prisma, parsedReqBody.data);
    if (result.status === "error") {
      switch (result.error.message) {
        case "USER_NAME_ALREADY_REGISTERED":
          return reply.status(400).send({ code: "USER_NAME_ALREADY_REGISTERED" });
      }
    }
    const {
      data: { user },
    } = result;

    const session = await createSession(prisma, user.id);
    return reply
      .setCookie("otmd-session", session, {
        httpOnly: true,
        secure: "auto",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/",
      })
      .send({ id: user.id });
  }) satisfies RouteHandlerMethod;
