import { UserRole } from "@prisma/client";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import z from "zod";

import { UserContext } from "./resolvers/types.js";
import { err, ok, Result } from "./utils/Result.js";

export const extractTokenFromReq = (req: IncomingMessage): Result<{ type: "NO_TOKEN" }, string> => {
  const token = req.headers.authorization?.split(" ").at(1);
  if (!token) return err({ type: "NO_TOKEN" });
  return ok(token);
};

export const verifyToken = async (
  token: string
): Promise<
  Result<
    | { type: "TOKEN_EXPIRED" }
    | { type: "INVALID_PAYLOAD"; payload: unknown }
    | { type: "UNKNOWN_ERROR"; error: unknown },
    UserContext
  >
> => {
  try {
    // eslint-disable-next-line no-process-env
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const parsed = z.object({ sub: z.string() }).safeParse(payload);
    if (!parsed.success) return err({ type: "INVALID_PAYLOAD", payload: parsed.error });

    const { sub } = parsed.data;
    return ok({
      currentUser: {
        id: sub,
        role: UserRole.ADMINISTRATOR, // TODO: 全然嘘だけど一旦これで
        permissions: [],
      },
    } satisfies UserContext);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return err({ type: "TOKEN_EXPIRED" });
    else return err({ type: "UNKNOWN_ERROR", error: e });
  }
};
