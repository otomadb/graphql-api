import * as argon2 from "argon2";
import { Middleware } from "koa";
import { ulid } from "ulid";
import { z } from "zod";

import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";

export const handlerSignup: Middleware = async ({ request, response }) => {
  const parseResult = z
    .object({
      name: z.string(),
      displayName: z.string(),
      email: z.string(),
      password: z.string(),
    })
    .safeParse(request.body);
  if (!parseResult.success) {
    response.status = 400;
    response.body = parseResult.error;
    return;
  }

  const { name, displayName, email, password } = parseResult.data;
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

  response.body({ id: user.id });
  return;
};
