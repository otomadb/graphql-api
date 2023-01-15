import * as argon2 from "argon2";
import { RouteHandlerMethod } from "fastify";
import { DataSource } from "typeorm";
import { ulid } from "ulid";
import { z } from "zod";

import { Mylist, MylistShareRange } from "../db/entities/mylists.js";
import { User, UserRole } from "../db/entities/users.js";
import { createSession } from "./createSession.js";

export const handlerSignup = ({ dataSource }: { dataSource: DataSource }) =>
  (async (req, reply) => {
    const parseRequest = z
      .object({ name: z.string(), displayName: z.string(), email: z.string(), password: z.string() })
      .safeParse(req.body);

    if (!parseRequest.success) {
      reply.status(400);
      reply.send({ code: "INVALID_REQUEST" });
      return;
    }
    const { name, displayName, email, password } = parseRequest.data;

    if (
      await dataSource
        .getRepository(User)
        .findOne({ where: { name } })
        .then((v) => !!v)
    ) {
      reply.status(400);
      reply.send({ code: "USER_NAME_ALREADY_REGISTERED" });
      return;
    }

    if (
      await dataSource
        .getRepository(User)
        .findOne({ where: { email } })
        .then((v) => !!v)
    ) {
      reply.status(400);
      reply.send({ code: "EMAIL_ALREADY_REGISTERED" });
      return;
    }

    const passwordHash = await argon2.hash(password, {
      type: 2,
      memoryCost: 15 * 1024,
      timeCost: 2,
      parallelism: 1,
    });
    const user = new User();
    user.id = ulid();
    user.name = name;
    user.displayName = displayName;
    user.email = email;
    user.icon = null;
    user.emailConfirmed = true; // FIXME: あとでなおす
    user.password = passwordHash;
    user.role = UserRole.NORMAL;

    const userRepository = dataSource.getRepository(User);
    await userRepository.insert(user);

    await dataSource.getRepository(Mylist).insert({
      id: ulid(),
      title: `favorites for ${user.displayName}`,
      range: MylistShareRange.PRIVATE,
      holder: { id: user.id },
      isLikeList: true,
    });

    const session = await createSession(dataSource, user);
    reply.setCookie("otmd-session", session, {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });
    reply.send({ id: user.id });
  }) satisfies RouteHandlerMethod;
