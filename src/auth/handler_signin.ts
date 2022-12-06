import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulid";
import { z } from "zod";
import { dataSource } from "../db/data-source.js";
import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export const handlerSignin = async (req: FastifyRequest, reply: FastifyReply) => {
  const parseResult = z
    .object({
      name: z.string(),
      password: z.string(),
    })
    .safeParse(req.body);
  if (!parseResult.success) {
    reply.status(400);
    reply.send(parseResult.error);
    return;
  }

  const { name, password } = parseResult.data;

  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { name } });
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

  const secret = randomBytes(32).toString("hex");

  const session = new Session();
  session.id = ulid();
  session.user = user;
  session.secret = createHash("sha256").update(secret).digest("hex");
  session.expiredAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 /* 10 days */);

  await dataSource.getRepository(Session).insert(session);

  req.cookies["otmd-session"];

  reply.setCookie("otmd-session", `${session.id}-${secret}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: "auto",
    path: "/",
  });
  reply.send({ id: user.id });
  return;
};
