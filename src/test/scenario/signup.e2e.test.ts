import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { PrismaClient } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { mock } from "jest-mock-extended";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { pino } from "pino";

import { ServerContext, UserContext } from "../../resolvers/context.js";
import { typeDefs } from "../../resolvers/graphql.js";
import { ResolverDeps, resolvers as makeResolvers } from "../../resolvers/index.js";
import { cleanPrisma } from "../cleanPrisma.js";

describe("Signup", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];

  let executor: SyncExecutor<any, HTTPExecutorOptions>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL! } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL!,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME!, process.env.TEST_NEO4J_PASSWORD!)
    );

    logger = pino({ transport: { targets: [{ target: "pino-pretty", level: "trace", options: {} }] } });

    const yoga = createYoga<ServerContext, UserContext>({
      schema: createSchema({
        typeDefs,
        resolvers: makeResolvers({ prisma, neo4j, logger }),
      }),
    });

    executor = buildHTTPExecutor({ fetch: yoga.fetch });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("signup", async () => {
    const req = mock<ServerContext["req"]>();
    const res = mock<ServerContext["res"]>();

    const result = await executor({
      document: parse(
        /* GraphQL */
        `
          mutation signup($input: SignupInput!) {
            signup(input: $input) {
              __typename
              ... on SignupSucceededPayload {
                user {
                  id
                }
              }
              ... on SignupFailedPayload {
                message
              }
            }
          }
        `
      ),
      variables: {
        input: {
          name: "testuser1",
          displayName: "Test User 1",
          password: "password",
          email: "testuser1@example.com",
        },
      },
      context: { req, res },
    });

    expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.any(String));
  });
});
