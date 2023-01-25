import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { RouteHandlerMethod } from "fastify";
import { z } from "zod";

import { createSession } from "./createSession.js";

export const handlerSignin = (prisma: PrismaClient) =>
  (async (req, reply) => {
    const { name, password } = z
      .object({
        name: z.string(),
        password: z.string(),
      })
      .parse(req.body);

    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) {
      reply.status(400);
      reply.send({ error: "user not found" });
      return;
    }

    if (!(await argon2.verify(user.password, password))) {
      reply.status(400);
      reply.send({ error: "password wrong" });
      return;
    }

    const session = await createSession(prisma, user.id);
    reply.setCookie("otmd-session", session, {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });
    reply.send({ id: user.id });
  }) satisfies RouteHandlerMethod;
