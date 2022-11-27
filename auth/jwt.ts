// https://codevoweb.com/deno-jwt-authentication-with-private-and-public-keys/

import type { KeyLike } from "jose";
import { jwtVerify, SignJWT } from "jose";
import { accessPrvKey, accessPubKey, refreshPrvKey, refreshPubKey } from "../common/env.js";

if (!accessPrvKey) {
  console.error(`cannot convert "ACCESS_TOKEN_PRIVATE_KEY"`);
  process.exit(1);
}
if (!refreshPrvKey) {
  console.error(`cannot convert "REFRESH_TOKEN_PRIVATE_KEY"`);
  process.exit(1);
}

const signJwtFactory =
  (key: KeyLike, { issuer, expiresIn }: { issuer: string; expiresIn: number }) =>
  async ({ userId }: { userId: string }) => {
    // const token = await create(header, payload, key);
    const token = await new SignJWT({})
      .setIssuedAt()
      .setIssuer(issuer)
      .setExpirationTime(`${expiresIn}s`)
      .setSubject(userId)
      .sign(key);
    return token;
  };

export const signAccessJWT = signJwtFactory(accessPrvKey, {
  issuer: "otomadb.com",
  expiresIn: 60 * 60,
});
export const signRefreshJWT = signJwtFactory(refreshPrvKey, {
  issuer: "otomadb.com",
  expiresIn: 60 * 60 * 24 * 3,
});

if (!accessPubKey) {
  console.error(`cannot convert "ACCESS_TOKEN_PUBLIC_KEY"`);
  process.exit(1);
}
if (!refreshPubKey) {
  console.error(`cannot convert "REFRESH_TOKEN_PUBLIC_KEY"`);
  process.exit(1);
}

const verifyJwtFactory = (key: KeyLike) => async ({ token }: { token: string }) => {
  try {
    const result = await jwtVerify(token, key);
    return result.payload;
  } catch (e) {
    if (e instanceof RangeError) {
      return null;
    } else {
      throw e;
    }
  }
};
export const verifyAccessJWT = verifyJwtFactory(accessPubKey);
export const verifyRefreshJWT = verifyJwtFactory(refreshPubKey);
