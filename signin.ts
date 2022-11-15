import { Database } from "mongo/mod.ts";
import { compare as compareBcrypt } from "bcrypt/mod.ts";
import { z } from "zod/mod.ts";
import { getUsersCollections } from "./collections.ts";
import { Result } from "./result.ts";
import { createToken } from "./token.ts";

const payloadSchema = z.object({ name: z.string(), password: z.string() });

export const signin = async (db: Database, payload: unknown): Promise<Result<{ access_token: string }>> => {
  const parsedPayload = payloadSchema.safeParse(payload);
  if (!parsedPayload.success) return { ok: false, error: { status: 400 } };

  const { name, password } = parsedPayload.data;

  const usersColl = getUsersCollections(db);
  const user = await usersColl.findOne({ $or: [{ name: name }, { email: name }] });

  if (!user) return { ok: false, error: { status: 404 } };
  const isMatchedPassword = await compareBcrypt(password, user.password);

  if (!isMatchedPassword) return { ok: false, error: { status: 401 } };

  const accessToken = await createToken({ id: user._id.toString() });

  return {
    ok: true,
    value: {
      access_token: accessToken,
    },
  };
};
