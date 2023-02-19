import { createServer } from "node:http";

import { usePrometheus } from "@envelop/prometheus";
import { PrismaClient } from "@prisma/client";
import { print } from "graphql";
import { createSchema, createYoga, useLogger } from "graphql-yoga";
import neo4j from "neo4j-driver";
import { pino } from "pino";

import { extractSessionFromReq, verifySession } from "./auth/session.js";
import { ServerContext, UserContext } from "./resolvers/context.js";
import { typeDefs } from "./resolvers/graphql.js";
import { resolvers as makeResolvers } from "./resolvers/index.js";

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {},
      },
      {
        target: "pino/file",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {
          destination: "logs/out.log",
          mkdir: true,
        },
      },
    ],
  },
});

const prismaClient = new PrismaClient({ datasources: { db: { url: process.env.PRISMA_DATABASE_URL } } });

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const yoga = createYoga<ServerContext, UserContext>({
  graphiql: process.env.ENABLE_GRAPHIQL === "true",
  schema: createSchema({
    typeDefs,
    resolvers: makeResolvers({ neo4j: neo4jDriver, prisma: prismaClient, logger }),
  }),
  async context({ req }) {
    // from cookie
    const resultExtractSession = extractSessionFromReq(req);
    if (resultExtractSession.status === "error") {
      switch (resultExtractSession.error.type) {
        case "INVALID_FORM":
          logger.warn({ cookie: resultExtractSession.error.cookie }, "Cookie is invalid form for session");
          break;
      }
    } else {
      const session = await verifySession(prismaClient, resultExtractSession.data);
      if (session.status === "ok")
        return {
          userId: session.data.userId,
          user: { id: session.data.user.id, role: session.data.user.role },
        } satisfies UserContext;
      else {
        switch (session.error.type) {
          case "NOT_FOUND_SESSION":
            logger.warn({ id: session.error.id }, "Session not found");
            break;
          case "WRONG_SECRET":
            logger.warn({ id: session.error.id, secret: session.error.secret }, "Session secret is incorrect");
            break;
        }
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
  plugins: [
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
    }),
    useLogger({
      logFn(event, data) {
        switch (event) {
          case "execute-end":
            logger.info(
              {
                operation: data.args.operationName,
                variables: data.args.variableValues,
                result: data.result,
                user: data.args.contextValue.user,
                query: print(data.args.document),
              },
              "GraphQL Executed"
            );
            break;
        }
      },
    }),
  ],
});

const server = createServer(yoga);
server.listen(8080, () => {
  logger.info("Server is running on http://localhost:8080");
});
