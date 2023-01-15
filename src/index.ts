import cookie, { FastifyCookieOptions } from "@fastify/cookie";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { createSchema, createYoga } from "graphql-yoga";
import neo4j from "neo4j-driver";
import { DataSource } from "typeorm";

import { getUserFromSession } from "./auth/getUserFromSession.js";
import { handlerSignin } from "./auth/signin.js";
import { handlerSignout } from "./auth/signout.js";
import { handlerSignup } from "./auth/signup.js";
import { entities } from "./db/entities/index.js";
import { typeDefs } from "./graphql.js";
import { handlerRemoteNicovideo } from "./remote/nicovideo.js";
import { resolvers as makeResolvers } from "./resolvers/index.js";

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
});
await dataSource.initialize();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

await app.register(cors, { credentials: true, origin: true } as FastifyCorsOptions);
await app.register(cookie, {} as FastifyCookieOptions);

const yoga = createYoga<{ req: FastifyRequest; reply: FastifyReply }>({
  schema: createSchema<{ req: FastifyRequest; reply: FastifyReply }>({
    typeDefs,
    resolvers: makeResolvers({ dataSource, neo4jDriver }),
  }),
  async context({ req, reply }) {
    const sessionToken = req.cookies["otmd-session"];

    if (sessionToken) {
      const user = await getUserFromSession({ dataSource })(sessionToken);
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
  },
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

app.post("/auth/signin", handlerSignin({ dataSource }));
app.post("/auth/signup", handlerSignup({ dataSource }));
app.post("/auth/signout", handlerSignout());

app.post("/auth/login", handlerSignin({ dataSource }));
app.post("/auth/logout", handlerSignout());

app.get<{ Querystring: { id: string } }>("/remote/nicovideo", handlerRemoteNicovideo);

app
  .listen({ port: 8080 })
  .then((serverUrl) => {
    app.log.info(`server listening at ${serverUrl}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
