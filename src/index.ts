import { usePrometheus } from "@envelop/prometheus";
import cookie, { FastifyCookieOptions } from "@fastify/cookie";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { createSchema, createYoga } from "graphql-yoga";
import neo4j from "neo4j-driver";
import { DataSource } from "typeorm";

import { findUserFromAuthToken, findUserFromCookie } from "./auth/getUserFromSession.js";
import { handlerSignin } from "./auth/signin.js";
import { handlerSignout } from "./auth/signout.js";
import { handlerSignup } from "./auth/signup.js";
import { entities } from "./db/entities/index.js";
import metrics, { type FastifyMetricsOptions } from "./fastify/metrics/plugin.js";
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
    enabled: true,
    transport: {
      target: "pino-pretty",
    },
  },
});

await app.register(cors, { credentials: true, origin: true } satisfies FastifyCorsOptions);
await app.register(cookie, {} satisfies FastifyCookieOptions);
await app.register(metrics, { endpoint: "/metrics" } as FastifyMetricsOptions);

const yoga = createYoga<{ req: FastifyRequest; reply: FastifyReply }>({
  schema: createSchema<{ req: FastifyRequest; reply: FastifyReply }>({
    typeDefs,
    resolvers: makeResolvers({ dataSource, neo4jDriver }),
  }),
  async context({ req }) {
    const cookie = req.cookies["otmd-session"];
    if (cookie) {
      const user = await findUserFromCookie({ dataSource })(cookie);
      if (user) return { user };
    }

    const authToken = req.headers["authorization"]?.split(" ").at(1);
    if (authToken) {
      const user = await findUserFromAuthToken({ dataSource })(authToken);
      if (user) return { user };
    }

    return {};
  },
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
  plugins: [
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
      resolvers: true,
    }),
  ],
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

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const host = process.env.HOST || "localhost";

if (isNaN(port)) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  app.log.error(`"${process.env.PORT!}" was specified as "PORT" but it cannot be parsed to port number`);
  process.exit(1);
}

app
  .listen({ port, host })
  .then((serverUrl) => {
    app.log.info(`server listening at ${serverUrl}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
