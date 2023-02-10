import { verify } from "argon2";

import { createSession } from "../../../auth/createSession.js";
import { MutationResolvers, SigninFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const signin = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { username, password } }, { reply }) => {
    const user = await prisma.user.findFirst({ where: { name: username } });

    if (!user)
      return {
        __typename: "SigninFailedPayload",
        message: SigninFailedMessage.UserNotFound,
      };

    if (!(await verify(user.password, password)))
      return {
        __typename: "SigninFailedPayload",
        message: SigninFailedMessage.WrongPassword,
      };

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
