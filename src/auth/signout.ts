import { RouteHandlerMethod } from "fastify";

export const handlerSignout = () =>
  (async (req, res) => {
    const sessionId = req.cookies["otmd-session"]?.split("-").at(0);
    if (sessionId) {
      // TODO: session expire
    }

    res.setCookie("otmd-session", "", {
      httpOnly: true,
      secure: "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });
    res.send({});
  }) satisfies RouteHandlerMethod;
