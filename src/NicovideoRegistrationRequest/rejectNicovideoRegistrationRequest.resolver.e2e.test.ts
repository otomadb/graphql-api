import { ResultOf } from "@graphql-typed-document-node/core";
import { PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { graphql } from "../gql/gql.js";
import { buildGqlId } from "../resolvers/id.js";
import { makeResolvers } from "../resolvers/index.js";
import { CurrentUser, ResolverDeps, ServerContext, UserContext } from "../resolvers/types.js";
import typeDefs from "../schema.graphql";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { makeExecutor } from "../test/makeExecutor.js";

const Mutation = graphql(`
  mutation E2E_RejectNicovideoRegistrationRequest($input: RejectNicovideoRegistrationRequestInput!) {
    rejectNicovideoRegistrationRequest(input: $input) {
      __typename
      ... on MutationNicovideoRegistrationRequestNotFoundError {
        requestId
      }
      ... on RejectNicovideoRegistrationRequestRequestAlreadyCheckedError {
        request {
          id
        }
      }
      ... on RejectNicovideoRegistrationRequestSucceededPayload {
        rejecting {
          note
          request {
            id
          }
        }
      }
    }
  }
`);
describe("Mutation.rejectNicovideoRegistrationRequest e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let otherMocks: DeepMockProxy<Omit<ResolverDeps, "prisma" | "neo4j">>;

  let executor: ReturnType<typeof makeExecutor>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.NEO4J_URL,
      neo4jAuth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );

    otherMocks = mockDeep();

    const schema = createSchema({
      typeDefs,
      resolvers: makeResolvers({ prisma, neo4j, ...otherMocks }),
    });
    const yoga = createYoga<ServerContext, UserContext>({ schema });
    executor = makeExecutor(yoga);
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
    // TODO: neo4jのreset処理
    mockReset(otherMocks);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await neo4j.close();
  });

  /**
   * 既にリクエストがあって，拒否しようとするが，既にチェック済みなので失敗する
   */
  test("シナリオ3", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.user.create({
        data: {
          id: "u2",
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
      operation: Mutation,
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: {
        currentUser: {
          id: "u2",
          scopes: ["check:registration_request"],
        } satisfies CurrentUser,
      },
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "RejectNicovideoRegistrationRequestRequestAlreadyCheckedError",
        request: { id: buildGqlId("NicovideoRegistrationRequest", "r1") },
      } satisfies Extract<
        ResultOf<typeof Mutation>["rejectNicovideoRegistrationRequest"],
        { __typename: "RejectNicovideoRegistrationRequestRequestAlreadyCheckedError" }
      >,
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
        },
      }),
      prisma.user.create({
        data: {
          id: "u2",
        },
      }),
    ]);

    const requestResult = await executor({
      operation: Mutation,
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: {
        currentUser: {
          id: "u2",
          scopes: ["check:registration_request"],
        } satisfies CurrentUser,
      },
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "MutationNicovideoRegistrationRequestNotFoundError",
        requestId: "r1",
      } satisfies Extract<
        ResultOf<typeof Mutation>["rejectNicovideoRegistrationRequest"],
        { __typename: "MutationNicovideoRegistrationRequestNotFoundError" }
      >,
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
        },
      }),
      prisma.user.create({
        data: {
          id: "u2",
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
      operation: Mutation,
      variables: {
        input: {
          requestId: buildGqlId("NicovideoRegistrationRequest", "r1"),
          note: "a",
        },
      },
      context: {
        currentUser: {
          id: "u2",
          scopes: ["check:registration_request"],
        } satisfies CurrentUser,
      },
    });

    expect(requestResult.data).toStrictEqual({
      rejectNicovideoRegistrationRequest: {
        __typename: "RejectNicovideoRegistrationRequestSucceededPayload",
        rejecting: {
          note: "a",
          request: {
            id: buildGqlId("NicovideoRegistrationRequest", "r1"),
          },
        },
      } satisfies Extract<
        ResultOf<typeof Mutation>["rejectNicovideoRegistrationRequest"],
        { __typename: "RejectNicovideoRegistrationRequestSucceededPayload" }
      >,
    });
  });
});
