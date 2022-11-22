import { MongoClient } from "mongo/mod.ts";
import { signAccessJWT, signRefreshJWT, verifyRefreshJWT } from "./jwt.ts";

export class RefreshTokenPayload {
  public accessToken;
  public refreshToken;

  constructor({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export const refreshToken = async ({ token }: { token: string }, {}: { mongo: MongoClient }) => {
  try {
    const payload = await verifyRefreshJWT({ token });
    if (!payload.sub) return null;

    const accessToken = await signAccessJWT({ userId: payload.sub });
    const refreshToken = await signRefreshJWT({ userId: payload.sub });
    return new RefreshTokenPayload({ accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return null;
  }
};
