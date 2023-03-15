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

export const signToken = ({ userId, duration }: { userId: string; duration: "1d" }) => {
  // eslint-disable-next-line no-process-env
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: duration });
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
      user: {
        id: sub,
        role: UserRole.ADMINISTRATOR, // TODO: 全然嘘だけど一旦これで
      },
    } satisfies UserContext);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return err({ type: "TOKEN_EXPIRED" });
    else return err({ type: "UNKNOWN_ERROR", error: e });
  }
};
