import { MylistShareRange, User, UserRole } from "@prisma/client";
import { hash } from "argon2";

import { createSession } from "../../../auth/createSession.js";
import { Result } from "../../../utils/Result.js";
import { MutationResolvers, SignupFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const registerNewUser = async (
  prisma: ResolverDeps["prisma"],
  { name, displayName, email, password }: { name: string; displayName: string; email: string; password: string }
): Promise<Result<"EXISTS_USERNAME", User>> => {
  if (await prisma.user.findUnique({ where: { name } }))
    return {
      status: "error",
      error: "EXISTS_USERNAME",
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

export const signup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { name, displayName, email, password: rawPassword } }, { reply }) => {
    const result = await registerNewUser(prisma, { name, displayName, email, password: rawPassword });
    if (result.status === "error") {
      switch (result.error) {
        case "EXISTS_USERNAME":
          return { __typename: "SignupFailedPayload", message: SignupFailedMessage.ExistsUsername };
      }
    }

    const newUser = result.data;
    const session = await createSession(prisma, newUser.id);
    reply.setCookie("otmd-session", session, {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    return {
      __typename: "SignupSuccessedPayload",
      user: new UserModel(newUser),
    };
  }) satisfies MutationResolvers["signup"];
