import { createServer } from "node:http";

import { usePrometheus } from "@envelop/prometheus";
import { PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import neo4j from "neo4j-driver";

import { extractSessionFromReq, verifySession } from "./auth/session.js";
import { ServerContext, UserContext } from "./resolvers/context.js";
import { typeDefs } from "./resolvers/graphql.js";
import { resolvers as makeResolvers } from "./resolvers/index.js";

const prismaClient = new PrismaClient({ datasources: { db: { url: process.env.PRISMA_DATABASE_URL } } });

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

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
      if (session.status === "ok")
        return {
          userId: session.data.userId,
          user: { id: session.data.user.id, role: session.data.user.role },
        } satisfies UserContext;
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

    return { userId: null, user: null } satisfies UserContext;

    /* # TODO: 一旦廃止
    // from authorization
    const authToken = req.headers["authorization"]?.split(" ").at(1);
    if (authToken) {
      const session = await findSessionFromAuthzToken(prismaClient, authToken);
      if (session)
        return {
          userId: session.id,
          user: { id: session.data.user.id, role: session.data.user.role },
        } satisfies UserContext;
    }
    return { userId: null } satisfies UserContext;
    */
  },
  cors: (request) => {
    const origin = request.headers.get("origin");
    return {
      origin: origin || [],
      credentials: true,
    };
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
    /*
    useLogger({
      logFn: console.log,
    }),
    */
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
