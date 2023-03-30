import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { PrismaClient } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mock, mockDeep, mockReset } from "vitest-mock-extended";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { typeDefs } from "../../graphql.js";
import { makeResolvers } from "../../index.js";
import { ResolverDeps, ServerContext, UserContext } from "../../types.js";

describe("Mutation.registerVideoFromNicovideo e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: ResolverDeps["config"];
  let meilisearch: DeepMockProxy<ResolverDeps["meilisearch"]>;
  let token: DeepMockProxy<ResolverDeps["meilisearch"]>;

  let executor: SyncExecutor<unknown, HTTPExecutorOptions>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME, process.env.TEST_NEO4J_PASSWORD)
    );

    logger = mock<ResolverDeps["logger"]>();
    config = mock<ResolverDeps["config"]>();
    meilisearch = mockDeep<ResolverDeps["meilisearch"]>();
    token = mockDeep<ResolverDeps["token"]>();

    const schema = createSchema({
      typeDefs,
      resolvers: makeResolvers({ prisma, neo4j, logger, config, meilisearch, token }),
    });
    const yoga = createYoga<ServerContext, UserContext>({ schema });
    executor = buildHTTPExecutor({ fetch: yoga.fetch });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
    // TODO: neo4jのreset処理

    mockReset(logger);
    mockReset(config);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await neo4j.close();
  });

  test.each([[{}, {}]])("不適当なinput: %#", async (input, expected) => {
    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation E2ETest_Mutation_RegisterVideoFromNicovideo_Invalid_Input($input: RegisterTagInput!) {
          registerVideoFromNicovideo(input: $input) {
            __typename
            ... on RegisterVideoFromNicovideoSemitagTooLongError {
              name
            }
          }
        }
      `),
      variables: { input },
      context: { user: { id: "u1", role: "EDITOR" } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      registerTag: expected,
    });
  });
});
