import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { PrismaClient } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ServerContext, UserContext } from "../../context.js";
import { typeDefs } from "../../graphql.js";
import { makeResolvers, ResolverDeps } from "../../index.js";

describe("Signup", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: DeepMockProxy<ResolverDeps["config"]>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME, process.env.TEST_NEO4J_PASSWORD)
    );

    logger = mockDeep<ResolverDeps["logger"]>();
    config = mockDeep<ResolverDeps["config"]>();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);

    mockReset(logger);
    mockReset(config);

    config.session.cookieName.mockReturnValue("otomadb_session");
    config.session.cookieDomain.mockReturnValue("otomadb.com");
    config.session.cookieSameSite.mockReturnValue("strict");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("signupに成功する", async () => {
    const req = mockDeep<ServerContext["req"]>();
    const res = mockDeep<ServerContext["res"]>();

    const schema = createSchema({
      typeDefs,
      resolvers: makeResolvers({ prisma, neo4j, logger, config }),
    });
    const yoga = createYoga<ServerContext, UserContext>({
      schema,
    });

    const executor = buildHTTPExecutor({ fetch: yoga.fetch });

    const result = await executor({
      document: parse(/* GraphQL */ `
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
      `),
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
    expect(result.data).toStrictEqual({
      signup: {
        __typename: "SignupSucceededPayload",
        user: {
          id: expect.any(String),
        },
      },
    });
  });
});
