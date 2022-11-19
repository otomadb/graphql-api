// https://codevoweb.com/deno-jwt-authentication-with-private-and-public-keys/

import { create, getNumericDate, Header, Payload, verify } from "djwt/mod.ts";
import { accessPrvKey, accessPubKey, refreshPrvKey, refreshPubKey } from "./env.ts";

if (!accessPrvKey) {
  console.error(`cannot convert "ACCESS_TOKEN_PRIVATE_KEY"`);
  Deno.exit(1);
}
if (!refreshPrvKey) {
  console.error(`cannot convert "REFRESH_TOKEN_PRIVATE_KEY"`);
  Deno.exit(1);
}

const signJwtFactory =
  (key: CryptoKey) => async ({ userId, issuer, expiresIn }: { userId: string; issuer: string; expiresIn: number }) => {
    const header: Header = { alg: "RS256", typ: "JWT" };

    const tokenIssuedAt = Math.floor(Date.now() / 1000);
    const tokenExpiredIn = getNumericDate(expiresIn);

    const payload: Payload = {
      iss: issuer,
      iat: tokenIssuedAt,
      exp: tokenExpiredIn,
      sub: userId,
    };

    const token = await create(header, payload, key);
    return token;
  };

export const signAccessJWT = signJwtFactory(accessPrvKey);
export const signRefreshJWT = signJwtFactory(refreshPrvKey);

if (!accessPubKey) {
  console.error(`cannot convert "ACCESS_TOKEN_PUBLIC_KEY"`);
  Deno.exit(1);
}
if (!refreshPubKey) {
  console.error(`cannot convert "REFRESH_TOKEN_PUBLIC_KEY"`);
  Deno.exit(1);
}

const verifyJwtFactory = (key: CryptoKey) => async ({ token }: { token: string }) => {
  const result = await verify(token, key);
  return result;
};
export const verifyAccessJWT = verifyJwtFactory(accessPubKey);
export const verifyRefreshJWT = verifyJwtFactory(refreshPubKey);
