import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { PrismaClient, UserRole } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { mock, mockReset } from "vitest-mock-extended";

import { ServerContext, UserContext } from "../../resolvers/context.js";
import {
  MutationAuthenticationError,
  NicovideoRegistrationRequest,
  RequestNicovideoRegistrationSucceededPayload,
  typeDefs,
  UserRole as GraphQLUserRole,
} from "../../resolvers/graphql.js";
import { buildGqlId } from "../../resolvers/id.js";
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

  /**
   * そもそもユーザがログインしていないならリクエストが失敗する
   */
  test("シナリオ1", async () => {
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
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on RequestNicovideoRegistrationTagNotFoundError {
              tagId
            }
            ... on RequestNicovideoRegistrationVideoAlreadyRegisteredError {
              source {
                id
              }
            }
            ... on RequestNicovideoRegistrationOtherErrorsFallback {
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
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies MutationAuthenticationError,
    });
  });

  /**
   * ユーザu1でログインしていればリクエストに成功する
   */
  test("シナリオ2", async () => {
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
      prisma.tag.createMany({
        data: [
          { id: "t1", meaningless: false },
          { id: "t2", meaningless: false },
        ],
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
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on RequestNicovideoRegistrationTagNotFoundError {
              tagId
            }
            ... on RequestNicovideoRegistrationVideoAlreadyRegisteredError {
              source {
                id
              }
            }
            ... on RequestNicovideoRegistrationOtherErrorsFallback {
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
      variables: {
        input: {
          sourceId: "sm9",
          title: "タイトル1",
          taggings: [
            { tagId: "t1", note: "a" },
            { tagId: "t2", note: "b" },
          ],
          semitaggings: [
            { name: "Semitag 1", note: "c" },
            { name: "Semitag 2", note: "d" },
          ],
        },
      },
      context: { user: { id: "u1", role: UserRole.NORMAL } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      requestNicovideoRegistration: {
        __typename: "RequestNicovideoRegistrationSucceededPayload",
        request: { id: expect.any(String) } as NicovideoRegistrationRequest,
      } satisfies RequestNicovideoRegistrationSucceededPayload,
    });

    const getRequestsResult = await executor({
      document: parse(/* GraphQL */ `
        query GetRequest($id: ID!) {
          NicovideoRegistrationRequest(id: $id) {
            id
            title
            sourceId
            taggings {
              tag {
                id
              }
              note
            }
            semitaggings {
              name
              note
            }
            requestedBy {
              id
            }
          }
        }
      `),
      variables: { id: requestResult.data.requestNicovideoRegistration.request.id },
    });
    expect(getRequestsResult.data.NicovideoRegistrationRequest).toStrictEqual({
      id: requestResult.data.requestNicovideoRegistration.request.id,
      requestedBy: {
        id: buildGqlId("User", "u1"),
      },
      sourceId: "sm9",
      title: "タイトル1",
      taggings: expect.arrayContaining([
        {
          tag: { id: buildGqlId("Tag", "t1") },
          note: "a",
        },
        {
          tag: { id: buildGqlId("Tag", "t2") },
          note: "b",
        },
      ]),
      semitaggings: expect.arrayContaining([
        {
          name: "Semitag 1",
          note: "c",
        },
        {
          name: "Semitag 2",
          note: "d",
        },
      ]),
    });

    const findRequestsResult = await executor({
      document: parse(/* GraphQL */ `
        query FindRequests {
          findNicovideoRegistrationRequests(input: {}) {
            nodes {
              id
            }
          }
        }
      `),
      variables: { input: {} },
    });
    expect(findRequestsResult.data.findNicovideoRegistrationRequests.nodes).toHaveLength(1);
    expect(findRequestsResult.data.findNicovideoRegistrationRequests.nodes).toStrictEqual(
      expect.arrayContaining([{ id: requestResult.data.requestNicovideoRegistration.request.id }])
    );
  });
});
