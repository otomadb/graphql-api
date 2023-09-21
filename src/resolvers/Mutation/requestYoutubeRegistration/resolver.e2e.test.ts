import type { ResultOf } from "@graphql-typed-document-node/core";
import { PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { graphql } from "../../../gql/gql.js";
import typeDefs from "../../../schema.graphql";
import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { makeExecutor } from "../../../test/makeExecutor.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers } from "../../index.js";
import { CurrentUser, ResolverDeps, ServerContext, UserContext } from "../../types.js";

const Mutation = graphql(`
  mutation E2E_RequestYoutubeRegistration($input: RequestYoutubeRegistrationInput!) {
    requestYoutubeRegistration(input: $input) {
      __typename

      ... on MutationTagNotFoundError {
        tagId
      }
      ... on RequestYoutubeRegistrationVideoAlreadyRegisteredError {
        source {
          id
        }
      }
      ... on RequestYoutubeRegistrationSucceededPayload {
        request {
          id
          title
          sourceId
          thumbnailUrl
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
        }
      }
    }
  }
`);

describe("Mutation.requestYoutubeRegistration e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let otherMocks: DeepMockProxy<Omit<ResolverDeps, "prisma" | "neo4j">>;

  let executor: ReturnType<typeof makeExecutor>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.NEO4J_URL,
      neo4jAuth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
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
   * ユーザu1でログインしていればリクエストに成功する
   */
  test("シナリオ2", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", isCategoryTag: false },
          { id: "t2", isCategoryTag: false },
        ],
      }),
    ]);

    const requestResult = await executor({
      operation: Mutation,
      variables: {
        input: {
          sourceId: "sm9",
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
          taggings: [
            { tagId: buildGqlId("Tag", "t1"), note: "a" },
            { tagId: buildGqlId("Tag", "t2"), note: "b" },
          ],
          semitaggings: [
            { name: "Semitag 1", note: "c" },
            { name: "Semitag 2", note: "d" },
          ],
        },
      },
      context: {
        currentUser: {
          id: "u1",
          scopes: ["create:registration_request"],
        } satisfies CurrentUser,
      },
    });

    expect(requestResult.data).toStrictEqual({
      requestYoutubeRegistration: {
        __typename: "RequestYoutubeRegistrationSucceededPayload",
        request: {
          id: expect.any(String),
          sourceId: "sm9",
          title: "タイトル1",
          thumbnailUrl: "https://example.com/thumbnail.jpg",
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
        },
      } satisfies Extract<
        ResultOf<typeof Mutation>["requestYoutubeRegistration"],
        { __typename: "RequestYoutubeRegistrationSucceededPayload" }
      >,
    });
  });
});
