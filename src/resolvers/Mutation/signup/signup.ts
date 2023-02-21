import { MylistShareRange, User, UserRole } from "@prisma/client";
import { hash } from "argon2";
import { serialize as serializeCookie } from "cookie";

import { createSession } from "../../../auth/session.js";
import { Result } from "../../../utils/Result.js";
import { MutationResolvers, SignupFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const registerNewUser = async (
  prisma: ResolverDeps["prisma"],
  { name, displayName, email, password }: { name: string; displayName: string; email: string; password: string }
): Promise<Result<"EXISTS_USERNAME" | "EXISTS_EMAIL", User>> => {
  if (await prisma.user.findUnique({ where: { name } }))
    return {
      status: "error",
      error: "EXISTS_USERNAME",
    };
  if (await prisma.user.findUnique({ where: { email } }))
    return {
      status: "error",
      error: "EXISTS_EMAIL",
    };

  const isExistAdmin = !!(await prisma.user.findFirst({ where: { role: UserRole.ADMINISTRATOR } }));

  const hashedPassword = await hash(password, {
    type: 2,
    memoryCost: 15 * 1024,
    timeCost: 2,
    parallelism: 1,
  });

  const newUser = await prisma.user.create({
    data: {
      name,
      displayName,
      email,
      password: hashedPassword,
      icon: null,
      isEmailConfirmed: true, // TODO: fix
      role: isExistAdmin ? UserRole.NORMAL : UserRole.ADMINISTRATOR,
      mylists: {
        create: {
          isLikeList: true,
          title: `Favlist for ${name}`,
          shareRange: MylistShareRange.PRIVATE,
        },
      },
    },
  });

  return {
    status: "ok",
    data: newUser,
  };
};

export const signup = ({ prisma, config }: Pick<ResolverDeps, "prisma" | "config">) =>
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
