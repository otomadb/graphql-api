import { usePrometheus } from "@envelop/prometheus";
import cookie, { FastifyCookieOptions } from "@fastify/cookie";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { createSchema, createYoga } from "graphql-yoga";
import neo4j from "neo4j-driver";
import prometheusClient from "prom-client";

import { findUserFromAuthToken, findUserFromCookie } from "./auth/getUserFromSession.js";
import { handlerSignin } from "./auth/signin.js";
import { handlerSignout } from "./auth/signout.js";
import { handlerSignup } from "./auth/signup.js";
import { typeDefs } from "./graphql.js";
import { handlerRemoteNicovideo } from "./remote/nicovideo.js";
import { resolvers as makeResolvers } from "./resolvers/index.js";

const prismaClient = new PrismaClient();

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

// metrics
prometheusClient.register.clear();

const requestHistogram = new prometheusClient.Histogram({
  name: "http_request_duration_seconds",
  help: "request duration in seconds",
  labelNames: ["method", "status_code", "route"],
});
const requestSummary = new prometheusClient.Summary({
  name: "http_request_summary_seconds",
  help: "request duration in seconds summary",
  labelNames: ["method", "status_code", "route"],
});
const requestTimersMap = new WeakMap<
  FastifyRequest,
  {
    history: ReturnType<(typeof requestHistogram)["startTimer"]>;
    summary: ReturnType<(typeof requestSummary)["startTimer"]>;
  }
>();
app
  .addHook<Record<string, never>, { collectMetrics?: boolean }>("onRequest", (req, _reply, done) => {
    if (!req.routeConfig?.collectMetrics) return done();
    requestTimersMap.set(req, {
      history: requestHistogram.startTimer(),
      summary: requestSummary.startTimer(),
    });
    return done();
  })
  .addHook("onResponse", (req, reply, done) => {
    const timers = requestTimersMap.get(req);
    if (!timers) return done();

    const method = req.method;
    const statusCode = reply.statusCode;
    const route = req.routerPath;

    const labels = { method, route, status_code: statusCode };
    timers.history(labels);
    timers.summary(labels);
    return done();
  })
  .route<Record<string, never>, { collectMetrics: boolean }>({
    url: "/metrics",
    method: "GET",
    handler: async (_req, reply) => {
      const register = prometheusClient.register;
      const metrics = await register.metrics();
      return reply.type(register.contentType).send(metrics);
    },
    config: { collectMetrics: true },
  });

// graphql
const yoga = createYoga<{ req: FastifyRequest; reply: FastifyReply }>({
  schema: createSchema<{ req: FastifyRequest; reply: FastifyReply }>({
    typeDefs,
    resolvers: makeResolvers({ neo4jDriver, prisma: prismaClient }),
  }),
  async context({ req }) {
    const cookie = req.cookies["otmd-session"];
    if (cookie) {
      const user = await findUserFromCookie(prismaClient, cookie);
      if (user) return { user };
    }

    const authToken = req.headers["authorization"]?.split(" ").at(1);
    if (authToken) {
      const user = await findUserFromAuthToken(prismaClient, authToken);
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
    }),
  ],
});
app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS"],
  config: { collectMetrics: true },
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

app.post("/auth/signin", { config: { collectMetrics: true } }, handlerSignin(prismaClient));
app.post("/auth/signup", { config: { collectMetrics: true } }, handlerSignup(prismaClient));
app.post("/auth/signout", { config: { collectMetrics: true } }, handlerSignout());

app.post("/auth/login", { config: { collectMetrics: true } }, handlerSignin(prismaClient));
app.post("/auth/logout", { config: { collectMetrics: true } }, handlerSignout());

app.get<{ Querystring: { id: string } }>(
  "/remote/nicovideo",
  { config: { collectMetrics: true } },
  handlerRemoteNicovideo
);

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
