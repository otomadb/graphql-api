import { MongoClient } from "mongodb";
import { signAccessJWT, signRefreshJWT, verifyRefreshJWT } from "./jwt.js";

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
    if (payload == null || !payload.sub) return null;

    const accessToken = await signAccessJWT({ userId: payload.sub });
    const refreshToken = await signRefreshJWT({ userId: payload.sub });
    return new RefreshTokenPayload({ accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return null;
  }
};
