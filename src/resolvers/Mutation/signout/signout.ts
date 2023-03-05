import { Session } from "@prisma/client";
import { serialize as serializeCookie } from "cookie";

import { extractSessionFromReq } from "../../../auth/session.js";
import { ok, Result } from "../../../utils/Result.js";
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
  return ok(session);
};

export const signout = ({ prisma, logger, config }: Pick<ResolverDeps, "prisma" | "logger" | "config">) =>
  (async (_parent, _args, { req, res }) => {
    const resultExtractSession = extractSessionFromReq(req, config.session.cookieName());
    if (resultExtractSession.status === "error") {
      switch (resultExtractSession.error.type) {
        case "NO_COOKIE":
          logger.warn("Cookie not found");
          return { __typename: "SignoutFailedPayload", message: SignoutFailedMessage.NoSessionId };
        case "INVALID_FORM":
          logger.warn({ cookie: resultExtractSession.error.cookie }, "Cookie is invalid form for session");
          return { __typename: "SignoutFailedPayload", message: SignoutFailedMessage.NoSessionId };
      }
    }

    const { id, secret } = resultExtractSession.data;
    // TODO: 不正なsessionのチェック

    const result = await expire(prisma, id);
    if (result.status === "error") {
      switch (result.error) {
        case "SESSION_NOT_FOUND":
          return { __typename: "SignoutFailedPayload", message: SignoutFailedMessage.SessionNotFound };
      }
    }

    const session = result.data;

    res.setHeader(
      "Set-Cookie",
      serializeCookie(config.session.cookieName(), "", {
        domain: config.session.cookieDomain(),
        httpOnly: true,
        secure: true,
        sameSite: config.session.cookieSameSite(),
        path: "/",
      })
    );

    return {
      __typename: "SignoutSucceededPayload",
      session: new SessionModel(session),
    };
  }) satisfies MutationResolvers["signout"];
