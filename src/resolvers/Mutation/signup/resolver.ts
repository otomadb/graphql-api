import { serialize as serializeCookie } from "cookie";

import { createSession } from "../../../auth/session.js";
import { MutationResolvers, SignupFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";
import { registerNewUser } from "./prisma.js";

export const resolverSignup = ({ prisma, config }: Pick<ResolverDeps, "prisma" | "config">) =>
  (async (_parent, { input: { name, displayName, email, password: rawPassword } }, { res }) => {
    const result = await registerNewUser(prisma, { name, displayName, email, password: rawPassword });
    if (result.status === "error") {
      switch (result.error) {
        case "EXISTS_USERNAME":
          return { __typename: "SignupFailedPayload", message: SignupFailedMessage.ExistsUsername };
        case "EXISTS_EMAIL":
          return { __typename: "SignupFailedPayload", message: SignupFailedMessage.ExistsEmail };
      }
    }

    const newUser = result.data;
    const session = await createSession(prisma, newUser.id);

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
      __typename: "SignupSucceededPayload",
      user: new UserModel(newUser),
    };
  }) satisfies MutationResolvers["signup"];
