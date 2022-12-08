import { Middleware } from "@koa/router";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { DataSource } from "typeorm";
import { ulid } from "ulid";
import { z } from "zod";

import { Session } from "../db/entities/sessions.js";
import { User } from "../db/entities/users.js";

export const handlerSignup =
  ({ dataSource }: { dataSource: DataSource }): Middleware =>
  async (ctx) => {
    const { name, displayName, email, password } = z
      .object({
        name: z.string(),
        displayName: z.string(),
        email: z.string(),
        password: z.string(),
      })
      .parse(ctx.request.body);

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
    user.icon = "";
    user.emailConfirmed = true; // FIXME: あとでなおす
    user.password = passwordHash;

    const userRepository = dataSource.getRepository(User);
    await userRepository.insert(user);

    ctx.body = { id: user.id };
  };

export const handlerSignin =
  ({ dataSource }: { dataSource: DataSource }): Middleware =>
  async (ctx) => {
    const { name, password } = z
      .object({
        name: z.string(),
        password: z.string(),
      })
      .parse(ctx.request.body);

    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { name } });
    if (!user) {
      ctx.status = 400;
      ctx.body = { error: "user not found" };
      return;
    }

    if (!(await argon2.verify(user.password, password))) {
      ctx.status = 400;
      ctx.body = { error: "password wrong" };
      return;
    }

    const secret = randomBytes(32).toString("hex");

    const session = new Session();
    session.id = ulid();
    session.user = user;
    session.secret = createHash("sha256").update(secret).digest("hex");
    session.expiredAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 /* 10 days */);

    await dataSource.getRepository(Session).insert(session);

    ctx.cookies.set("otmd-session", `${session.id}-${secret}`, {
      httpOnly: true,
      secure: ctx.secure,
      sameSite: "strict",
    });

    ctx.body = { id: user.id };
  };
