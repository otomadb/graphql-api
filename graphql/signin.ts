import { signAccessJWT, signRefreshJWT } from "~/jwt.ts";

export class SigninPayload {
  protected accessToken;
  protected refreshToken;

  constructor({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export const signin = async ({ name, password }: { name: string; password: string }) => {
  const accessToken = await signAccessJWT({
    issuer: "auth.exaple.com",
    userId: "1",
    expiresIn: 60 * 60,
  });
  const refreshToken = await signRefreshJWT({
    issuer: "auth.exaple.com",
    userId: "1",
    expiresIn: 60 * 60,
  });

  return new SigninPayload({
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};
