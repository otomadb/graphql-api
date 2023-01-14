import { Middleware } from "@koa/router";

export const handlerSignout = (): Middleware => async (ctx) => {
  const sessionId = ctx.cookies.get("otmd-session")?.split("-").at(0);
  if (sessionId) {
    // TODO: session expire
  }
  ctx.cookies.set("otmd-session", "", {
    httpOnly: true,
    secure: ctx.secure,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  ctx.body = {};
};
