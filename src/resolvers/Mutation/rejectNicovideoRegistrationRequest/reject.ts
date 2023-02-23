import { NicovideoRegistrationRequest, NicovideoRegistrationRequestChecking } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const reject = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    requestId,
    note,
  }: {
    userId: string;
    requestId: string;
    note: string;
  }
): Promise<
  Result<
    | { message: "REQUEST_NOT_FOUND"; requestId: string }
    | { message: "REQUEST_ALREADY_CHECKED"; request: NicovideoRegistrationRequest }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    NicovideoRegistrationRequestChecking
  >
> => {
  try {
    const request = await prisma.nicovideoRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return err({ message: "REQUEST_NOT_FOUND", requestId });
    } else if (request.isChecked) {
      return err({ message: "REQUEST_ALREADY_CHECKED", request });
    }

    const [checking] = await prisma.$transaction([
      prisma.nicovideoRegistrationRequestChecking.create({
        data: {
          id: ulid(),
          requestId,
          videoId: null,
          checkedById: userId,
          note,
        },
      }),
      prisma.nicovideoRegistrationRequest.update({
        where: { id: requestId },
        data: { isChecked: true },
      }),
    ]);

    return ok(checking);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
