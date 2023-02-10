import { Session } from "@prisma/client";

import { Result } from "../../../utils/Result.js";
import { MutationResolvers, SignoutFailedMessage } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { SessionModel } from "../../Session/model.js";

export const expire = async (
  prisma: ResolverDeps["prisma"],
  sessionId: string
): Promise<Result<"SESSION_NOT_FOUND", Session>> => {
  if (!(await prisma.session.findUnique({ where: { id: sessionId } })))
    return { status: "error", error: "SESSION_NOT_FOUND" };

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { isExpired: true },
  });
  return { status: "ok", data: session };
};

export const signout = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, _args, { req, reply }) => {
    const sessionId = req.cookies["otmd-session"]?.split("-").at(0);
    if (!sessionId) {
      return { __typename: "SignoutFailedPayload", message: SignoutFailedMessage.NoSessionId };
    }

    const result = await expire(prisma, sessionId);
    if (result.status === "error") {
      switch (result.error) {
        case "SESSION_NOT_FOUND":
          return { __typename: "SignoutFailedPayload", message: SignoutFailedMessage.SessionNotFound };
      }
    }

    const session = result.data;

    reply.setCookie("otmd-session", "", {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    return {
      __typename: "SignoutSuccessedPayload",
      session: new SessionModel(session),
    };
  }) satisfies MutationResolvers["signout"];
