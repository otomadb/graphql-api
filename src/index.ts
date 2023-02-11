import { createServer } from "node:http";

import { usePrometheus } from "@envelop/prometheus";
import { PrismaClient } from "@prisma/client";
import { createSchema, createYoga, useLogger } from "graphql-yoga";
import neo4j from "neo4j-driver";

import { extractSessionFromReq, verifySession } from "./auth/session.js";
import { findSessionFromAuthzToken } from "./auth/token.js";
import { ServerContext, UserContext } from "./resolvers/context.js";
import { typeDefs } from "./resolvers/graphql.js";
import { resolvers as makeResolvers } from "./resolvers/index.js";

const prismaClient = new PrismaClient({ datasources: { db: { url: process.env.PRISMA_DATABASE_URL } } });

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

/*
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

  */

// graphql
const yoga = createYoga<ServerContext, UserContext>({
  graphiql: process.env.ENABLE_GRAPHIQL === "true",
  schema: createSchema({
    typeDefs,
    resolvers: makeResolvers({ neo4j: neo4jDriver, prisma: prismaClient }),
  }),
  async context({ req }) {
    // from cookie
    const resultExtractSession = extractSessionFromReq(req);
    if (resultExtractSession.status === "ok") {
      const session = await verifySession(prismaClient, resultExtractSession.data);
      if (session.status === "ok") return { userId: session.data.userId } satisfies UserContext;
      else {
        switch (session.error) {
          case "NOT_FOUND_SESSION":
          case "WRONG_SECRET":
            // TODO: 明らかにおかしいのでログに残す
            break;
        }
      }
    } else {
      switch (resultExtractSession.error) {
        case "INVALID_FORM":
          // TODO: 不正なセッションなのでログに残す
          break;
      }
    }

    // from authorization
    const authToken = req.headers["authorization"]?.split(" ").at(1);
    if (authToken) {
      const session = await findSessionFromAuthzToken(prismaClient, authToken);
      if (session) return { userId: session.id } satisfies UserContext;
    }
    return { userId: null } satisfies UserContext;
  },
  /*
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
  */
  plugins: [
    useLogger({
      logFn: console.log,
    }),
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
    }),
  ],
});

const server = createServer(yoga);
server.listen(8080, () => {
  console.info("Server is running on http://localhost:8080/graphql");
});
