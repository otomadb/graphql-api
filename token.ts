import { create, decode, getNumericDate, Payload, verify } from "djwt/mod.ts";
import { Result } from "./result.ts";
import { z } from "zod/mod.ts";

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

export const createToken = ({ id }: { id: string }, exp: number = 60 * 60) =>
  create({ alg: "HS512" }, { sub: id, exp: getNumericDate(exp) }, key);

const tokenPayloadSchema = z.object({
  sub: z.string(),
  exp: z.number(),
});
export const verifyToken = async (token: string): Promise<Result<{ sub: string; exp: number }>> => {
  try {
    const payload = await verify(token, key);

    const parsedPaylod = tokenPayloadSchema.safeParse(payload);
    if (!parsedPaylod.success) return { ok: false, error: { status: 500 } };

    return {
      ok: true,
      value: parsedPaylod.data,
    };
  } catch (e) {
    return {
      ok: false,
      error: { status: 401, message: e.message },
    };
  }
};
export const decodeToken = (token: string) => decode(token);
