import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { PrismaClient, UserRole } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { mock, mockReset } from "vitest-mock-extended";

import { ServerContext, UserContext } from "../../resolvers/context.js";
import {
  NicovideoRegistrationRequest,
  RequestNicovideoRegistrationErrorFallback,
  RequestNicovideoRegistrationErrorFallbackMessage,
  RequestNicovideoRegistrationSucceededPayload,
  typeDefs,
} from "../../resolvers/graphql.js";
import { makeResolvers, ResolverDeps } from "../../resolvers/index.js";
import { cleanPrisma } from "../cleanPrisma.js";

describe("ニコニコ動画の動画リクエスト関連", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: ResolverDeps["config"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME, process.env.TEST_NEO4J_PASSWORD)
    );

    logger = mock<ResolverDeps["logger"]>();
    config = mock<ResolverDeps["config"]>();
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

  test("ユーザーがログインしていない場合は，リクエスト出来ない", async () => {
    const schema = createSchema({
      typeDefs,
      resolvers: makeResolvers({ prisma, neo4j, logger, config }),
    });
    const yoga = createYoga<ServerContext, UserContext>({ schema });
    const executor = buildHTTPExecutor({ fetch: yoga.fetch });

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ($input: RequestNicovideoRegistrationInput!) {
          requestNicovideoRegistration(input: $input) {
            __typename
            ... on RequestNicovideoRegistrationTagNotFoundError {
              tagId
            }
            ... on RequestNicovideoRegistrationVideoAlreadyRegisteredError {
              source {
                id
              }
            }
            ... on RequestNicovideoRegistrationErrorFallback {
              message
            }
            ... on RequestNicovideoRegistrationSucceededPayload {
              request {
                id
              }
            }
          }
        }
      `),
      variables: { input: { sourceId: "sm9", title: "タイトル 1", taggings: [], semitaggings: [] } },
      context: { user: null },
    });

    expect(requestResult.data).toStrictEqual({
      requestNicovideoRegistration: {
        __typename: "RequestNicovideoRegistrationErrorFallback",
        message: RequestNicovideoRegistrationErrorFallbackMessage.NotLoggedIn,
      } satisfies RequestNicovideoRegistrationErrorFallback,
    });
  });

  test("ユーザーがログインしている場合，リクエストに成功する", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
          name: "user1",
          displayName: "User 1",
          email: "user1@example.com",
          password: "password",
          role: UserRole.NORMAL,
        },
      }),
    ]);

    const schema = createSchema({
      typeDefs,
      resolvers: makeResolvers({ prisma, neo4j, logger, config }),
    });
    const yoga = createYoga<ServerContext, UserContext>({ schema });
    const executor = buildHTTPExecutor({ fetch: yoga.fetch });

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation Request($input: RequestNicovideoRegistrationInput!) {
          requestNicovideoRegistration(input: $input) {
            __typename
            ... on RequestNicovideoRegistrationTagNotFoundError {
              tagId
            }
            ... on RequestNicovideoRegistrationVideoAlreadyRegisteredError {
              source {
                id
              }
            }
            ... on RequestNicovideoRegistrationErrorFallback {
              message
            }
            ... on RequestNicovideoRegistrationSucceededPayload {
              request {
                id
              }
            }
          }
        }
      `),
      variables: { input: { sourceId: "sm9", title: "タイトル 1", taggings: [], semitaggings: [] } },
      context: { user: { id: "u1", role: UserRole.NORMAL } } as UserContext, // TODO: satisfiesに
    });

    expect(requestResult.data).toStrictEqual({
      requestNicovideoRegistration: {
        __typename: "RequestNicovideoRegistrationSucceededPayload",
        request: { id: expect.any(String) } as NicovideoRegistrationRequest,
      } satisfies RequestNicovideoRegistrationSucceededPayload,
    });
  });
});
