import { User } from "@prisma/client";
import { verify } from "argon2";
import { serialize as serializeCookie } from "cookie";

import { createSession } from "../../../auth/session.js";
import { ok, Result } from "../../../utils/Result.js";
import { MutationResolvers, SigninFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const verifyUser = async (
  prisma: ResolverDeps["prisma"],
  { password, username }: { username: string; password: string }
): Promise<Result<"USER_NOT_FOUND" | "WRONG_PASSWORD", User>> => {
  const user = await prisma.user.findFirst({ where: { name: username } });

  if (!user) return { status: "error", error: "USER_NOT_FOUND" };

  if (!(await verify(user.password, password))) return { status: "error", error: "USER_NOT_FOUND" };

  return ok(user);
};

export const signin = ({ prisma, config }: Pick<ResolverDeps, "prisma" | "config">) =>
  (async (_parent, { input: { username, password } }, { res }) => {
    const result = await verifyUser(prisma, { username, password });
    if (isErr(result)) {
      switch (result.error) {
        case "USER_NOT_FOUND":
          return { __typename: "SigninFailedPayload", message: SigninFailedMessage.UserNotFound };
        case "WRONG_PASSWORD":
          return { __typename: "SigninFailedPayload", message: SigninFailedMessage.WrongPassword };
      }
    }

    const user = result.data;

    const session = await createSession(prisma, user.id);

    res.setHeader(
      "Set-Cookie",
      serializeCookie(config.session.cookieName(), session, {
        domain: config.session.cookieDomain(),
        httpOnly: true,
        secure: true,
        sameSite: config.session.cookieSameSite(),
        path: "/",
      })
    );

    return {
      __typename: "SigninSucceededPayload",
      user: new UserModel(user),
    };
  }) satisfies MutationResolvers["signin"];
