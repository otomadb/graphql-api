import { MylistShareRange, User, UserRole } from "@prisma/client";
import { hash } from "argon2";

import { Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

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
      isEmailConfirmed: true,
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
