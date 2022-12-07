import { Middleware } from "@koa/router";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { ulid } from "ulid";
import { z } from "zod";

import { dataSource } from "../db/data-source.js";
import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export const handlerSignin: Middleware = async ({ request, response, cookies, secure }) => {
  const parseResult = z
    .object({
      name: z.string(),
      password: z.string(),
    })
    .safeParse(request.body);
  if (!parseResult.success) {
    response.status = 400;
    response.body = parseResult.error;
    return;
  }

  const { name, password } = parseResult.data;

  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { name } });
  if (!user) {
    response.status = 400;
    response.body = { error: "user not found" };
    return;
  }
  if (!(await argon2.verify(user.password, password))) {
    response.status = 400;
    response.body = { error: "password wrong" };
    return;
  }

  const secret = randomBytes(32).toString("hex");

  const session = new Session();
  session.id = ulid();
  session.user = user;
  session.secret = createHash("sha256").update(secret).digest("hex");
  session.expiredAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 /* 10 days */);

  await dataSource.getRepository(Session).insert(session);

  cookies.set("otmd-session", `${session.id}-${secret}`, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
  });
  response.body = { id: user.id };
  return;
};
