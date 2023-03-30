import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { PrismaClient, UserRole } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mock, mockDeep, mockReset } from "vitest-mock-extended";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import {
  MutationAuthenticationError,
  MutationNicovideoRegistrationRequestNotFoundError,
  NicovideoRegistrationRequest,
  RejectNicovideoRegistrationRequestRequestAlreadyCheckedError,
  RejectNicovideoRegistrationRequestSucceededPayload,
  typeDefs,
  User,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers } from "../../index.js";
import { ResolverDeps, ServerContext, UserContext } from "../../types.js";

describe("Mutation.rejectNicovideoRegistrationRequest e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: ResolverDeps["config"];
  let token: DeepMockProxy<ResolverDeps["token"]>;
  let meilisearch: DeepMockProxy<ResolverDeps["meilisearch"]>;

  let executor: SyncExecutor<unknown, HTTPExecutorOptions>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.NEO4J_URL,
      neo4jAuth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );

    logger = mock<ResolverDeps["logger"]>();
    config = mock<ResolverDeps["config"]>();
    token = mock<ResolverDeps["token"]>();
    meilisearch = mockDeep<ResolverDeps["meilisearch"]>();

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

  test("シナリオ1", async () => {
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
      prisma.nicovideoRegistrationRequest.create({
        data: {
          id: "r1",
          isChecked: false,
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          sourceId: "sm9",
          taggings: {},
          semitaggings: {},
          requestedById: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation NicovideoRegistrationRequests_Scenario1_Reject($input: RejectNicovideoRegistrationRequestInput!) {
          rejectNicovideoRegistrationRequest(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationNicovideoRegistrationRequestNotFoundError {
              requestId
            }
            ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
              request {
                id
              }
            }
            ... on RejectNicovideoRegistrationRequestOtherErrorsFallback {
              message
            }
            ... on RejectNicovideoRegistrationRequestSucceededPayload {
              rejecting {
                note
                rejectedBy {
                  id
                }
                request {
                  id
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: { user: null } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.Editor,
      } satisfies MutationAuthenticationError,
    });
  });

  /**
   * 既にリクエストがあって，拒否しようとするが，権限が足りないので失敗する
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
      prisma.user.create({
        data: {
          id: "u2",
          name: "user2",
          displayName: "User 2",
          email: "user2@example.com",
          password: "password",
          role: UserRole.EDITOR,
        },
      }),
      prisma.nicovideoRegistrationRequest.create({
        data: {
          id: "r1",
          isChecked: false,
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          sourceId: "sm9",
          taggings: {},
          semitaggings: {},
          requestedById: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation NicovideoRegistrationRequests_Scenario2_Reject($input: RejectNicovideoRegistrationRequestInput!) {
          rejectNicovideoRegistrationRequest(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationNicovideoRegistrationRequestNotFoundError {
              requestId
            }
            ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
              request {
                id
              }
            }
            ... on RejectNicovideoRegistrationRequestOtherErrorsFallback {
              message
            }
            ... on RejectNicovideoRegistrationRequestSucceededPayload {
              rejecting {
                note
                rejectedBy {
                  id
                }
                request {
                  id
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: { user: { id: "u2", role: UserRole.NORMAL } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.Editor,
      } satisfies MutationAuthenticationError,
    });
  });

  /**
   * 既にリクエストがあって，拒否しようとするが，既にチェック済みなので失敗する
   */
  test("シナリオ3", async () => {
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
      prisma.user.create({
        data: {
          id: "u2",
          name: "user2",
          displayName: "User 2",
          email: "user2@example.com",
          password: "password",
          role: UserRole.EDITOR,
        },
      }),
      prisma.nicovideoRegistrationRequest.create({
        data: {
          id: "r1",
          isChecked: true,
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          sourceId: "sm9",
          taggings: {},
          semitaggings: {},
          requestedById: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation NicovideoRegistrationRequests_Scenario3_Reject($input: RejectNicovideoRegistrationRequestInput!) {
          rejectNicovideoRegistrationRequest(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationNicovideoRegistrationRequestNotFoundError {
              requestId
            }
            ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
              request {
                id
              }
            }
            ... on RejectNicovideoRegistrationRequestOtherErrorsFallback {
              message
            }
            ... on RejectNicovideoRegistrationRequestSucceededPayload {
              rejecting {
                note
                rejectedBy {
                  id
                }
                request {
                  id
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: { user: { id: "u2", role: UserRole.EDITOR } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "RejectNicovideoRegistrationRequestRequestAlreadyCheckedError",
        request: {
          id: buildGqlId("NicovideoRegistrationRequest", "r1"),
        } as NicovideoRegistrationRequest,
      } satisfies RejectNicovideoRegistrationRequestRequestAlreadyCheckedError,
    });
  });

  /**
   * 存在しないリクエストを拒否しようとして失敗する
   */
  test("シナリオ4", async () => {
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
      prisma.user.create({
        data: {
          id: "u2",
          name: "user2",
          displayName: "User 2",
          email: "user2@example.com",
          password: "password",
          role: UserRole.EDITOR,
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation NicovideoRegistrationRequests_Scenario4_Reject($input: RejectNicovideoRegistrationRequestInput!) {
          rejectNicovideoRegistrationRequest(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationNicovideoRegistrationRequestNotFoundError {
              requestId
            }
            ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
              request {
                id
              }
            }
            ... on RejectNicovideoRegistrationRequestOtherErrorsFallback {
              message
            }
            ... on RejectNicovideoRegistrationRequestSucceededPayload {
              rejecting {
                note
                rejectedBy {
                  id
                }
                request {
                  id
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: { user: { id: "u2", role: UserRole.EDITOR } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "MutationNicovideoRegistrationRequestNotFoundError",
        requestId: "r1",
      } satisfies MutationNicovideoRegistrationRequestNotFoundError,
    });
  });

  /**
   * 既にリクエストがあって，拒否が成功する
   */
  test("シナリオ5", async () => {
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
      prisma.user.create({
        data: {
          id: "u2",
          name: "user2",
          displayName: "User 2",
          email: "user2@example.com",
          password: "password",
          role: UserRole.EDITOR,
        },
      }),
      prisma.nicovideoRegistrationRequest.create({
        data: {
          id: "r1",
          isChecked: false,
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          sourceId: "sm9",
          taggings: {},
          semitaggings: {},
          requestedById: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation NicovideoRegistrationRequests_Scenario5_Reject($input: RejectNicovideoRegistrationRequestInput!) {
          rejectNicovideoRegistrationRequest(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationNicovideoRegistrationRequestNotFoundError {
              requestId
            }
            ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
              request {
                id
              }
            }
            ... on RejectNicovideoRegistrationRequestOtherErrorsFallback {
              message
            }
            ... on RejectNicovideoRegistrationRequestSucceededPayload {
              rejecting {
                note
                rejectedBy {
                  id
                }
                request {
                  id
                }
              }
            }
          }
        }
      `),
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: { user: { id: "u2", role: UserRole.EDITOR } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "RejectNicovideoRegistrationRequestSucceededPayload",
        rejecting: {
          note: "a",
          request: {
            id: buildGqlId("NicovideoRegistrationRequest", "r1"),
          } as NicovideoRegistrationRequest,
          rejectedBy: {
            id: buildGqlId("User", "u2"),
          } as User,
        },
      } satisfies RejectNicovideoRegistrationRequestSucceededPayload,
    });
  });
});
