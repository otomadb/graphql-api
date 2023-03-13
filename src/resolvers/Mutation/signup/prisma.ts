import { MylistShareRange, User, UserRole } from "@prisma/client";
import { hash } from "argon2";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

const nameRegex = /^[a-zA-Z0-9_]+$/;

// https://github.com/colinhacks/zod/blob/a6b44ed8e346af2fabbb62b5164b99a387accd32/src/types.ts#L531
const emailRegex =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;

export const registerNewUser = async (
  prisma: ResolverDeps["prisma"],
  { name, displayName, email, password }: { name: string; displayName: string; email: string; password: string }
): Promise<
  Result<
    | { message: "NAME_ALREADY_EXISTS"; name: string }
    | { message: "NAME_INSUFFICIENT_MIN_LENGTH"; name: string }
    | { message: "NAME_INSUFFICIENT_MAX_LENGTH"; name: string }
    | { message: "NAME_WRONG_CHARACTER"; name: string }
    | { message: "DISPLAY_NAME_INSUFFICIENT_MIN_LENGTH"; displayName: string }
    | { message: "DISPLAY_NAME_INSUFFICIENT_MAX_LENGTH"; displayName: string }
    | { message: "EMAIL_ALREADY_EXISTS"; email: string }
    | { message: "EMAIL_INVALID_EMAIL_FORMAT"; email: string }
    | { message: "PASSWORD_INSUFFICIENT_MIN_LENGTH"; password: string }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    User
  >
> => {
  try {
    if (name.length < 3) return err({ message: "NAME_INSUFFICIENT_MIN_LENGTH", name });
    if (16 < name.length) return err({ message: "NAME_INSUFFICIENT_MAX_LENGTH", name });
    if (!nameRegex.test(name)) return err({ message: "NAME_WRONG_CHARACTER", name });

    if (displayName.length < 1) return err({ message: "DISPLAY_NAME_INSUFFICIENT_MIN_LENGTH", displayName });
    if (32 < displayName.length) return err({ message: "DISPLAY_NAME_INSUFFICIENT_MAX_LENGTH", displayName });

    if (!emailRegex.test(email)) return err({ email, message: "EMAIL_INVALID_EMAIL_FORMAT" });

    if (password.length < 8) return err({ message: "PASSWORD_INSUFFICIENT_MIN_LENGTH", password });

    if (await prisma.user.findUnique({ where: { name } })) return err({ message: "NAME_ALREADY_EXISTS", name });
    if (await prisma.user.findUnique({ where: { email } })) return err({ message: "EMAIL_ALREADY_EXISTS", email });

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
        isEmailConfirmed: false,
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

    return ok(newUser);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
