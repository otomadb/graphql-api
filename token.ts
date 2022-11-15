import { create, decode, getNumericDate, verify } from "djwt/mod.ts";

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

export const createToken = ({ name }: { name: string }, exp: number = 60 * 60) =>
  create({ alg: "HS512" }, { name, exp: getNumericDate(exp) }, key);

export const verifyToken = (token: string) => verify(token, key);
export const decodeToken = (token: string) => decode(token);
