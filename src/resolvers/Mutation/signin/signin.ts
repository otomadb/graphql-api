import { User } from "@prisma/client";
import { verify } from "argon2";

import { createSession } from "../../../auth/createSession.js";
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
  (async (_parent, { input: { username, password } }, { reply }) => {
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
    reply.setCookie("otmd-session", session, {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    return {
      __typename: "SigninSuccessedPayload",
      user: new UserModel(user),
    };
  }) satisfies MutationResolvers["signin"];
