import { User } from "@prisma/client";
import { verify } from "argon2";
import { serialize as serializeCookie } from "cookie";

import { createSession, OTOMADB_SESSION_COOKIE_NAME } from "../../../auth/session.js";
import { Result } from "../../../utils/Result.js";
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

  return { status: "ok", data: user };
};

export const signin = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { username, password } }, { res }) => {
    const result = await verifyUser(prisma, { username, password });
    if (result.status === "error") {
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
      serializeCookie(OTOMADB_SESSION_COOKIE_NAME, session, {
        domain: process.env.DOMAIN,
        httpOnly: true,
        secure: true,
        sameSite: process.env.ENABLE_SAME_SITE_NONE === "true" ? "none" : "strict",
        path: "/",
      })
    );

    return {
      __typename: "SigninSuccessedPayload",
      user: new UserModel(user),
    };
  }) satisfies MutationResolvers["signin"];
