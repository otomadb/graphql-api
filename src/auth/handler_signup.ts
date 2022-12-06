import * as argon2 from "argon2";
import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulid";
import { z } from "zod";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";

export const handlerSignup = async (req: FastifyRequest, reply: FastifyReply) => {
  const parseResult = z
    .object({
      name: z.string(),
      displayName: z.string(),
      email: z.string(),
      password: z.string(),
    })
    .safeParse(req.body);
  if (!parseResult.success) {
    reply.status(400);
    reply.send(parseResult.error);
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

  reply.send({ id: user.id });
  return;
};
