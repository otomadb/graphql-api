import "reflect-metadata";

import cookie, { FastifyCookieOptions } from "@fastify/cookie";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { createSchema, createYoga } from "graphql-yoga";
import { readFile } from "node:fs/promises";
import { handlerSignin } from "./auth/handler_signin.js";
import { handlerSignup } from "./auth/handler_signup.js";
import { getUserFromSession } from "./auth/session.js";
import { dataSource } from "./db/data-source.js";
import { resolvers } from "./resolvers/index.js";

await dataSource.initialize();

const app = fastify({
  logger: { transport: { target: "pino-pretty" } },
});

await app.register(cors, { credentials: true, origin: true } as FastifyCorsOptions);
await app.register(cookie, {} as FastifyCookieOptions);

// そのうち消す
app.post("/auth/signup", handlerSignup);
app.post("/auth/login", handlerSignin);

app.post("/signup", handlerSignup);
app.post("/signin", handlerSignin);

const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });
const schema = createSchema<{ req: FastifyRequest; reply: FastifyReply }>({ typeDefs, resolvers: resolvers });
const yoga = createYoga<{ req: FastifyRequest; reply: FastifyReply }>({
  schema,
  async context({ req, reply }) {
    const sessionToken = req.cookies["otmd-session"] ?? req.headers["authorization"]?.split(" ").at(1);
    if (sessionToken) {
      const user = await getUserFromSession(sessionToken);
      if (user) return { user };
    } else {
      reply.clearCookie("otmd-session");
      return {};
    }
  },
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  }, // TODO: 何？
});
app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS"],
  handler: async (req, reply) => {
    const response = await yoga.handleNodeRequest(req, { req, reply });

    for (const [name, value] of response.headers) {
      reply.header(name, value);
    }
    reply.status(response.status);
    reply.send(response.body);

    return reply;
  },
});

app
  .listen({ port: 4000 })
  .then((serverUrl) => {
    app.log.info(`server listening at ${serverUrl}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
