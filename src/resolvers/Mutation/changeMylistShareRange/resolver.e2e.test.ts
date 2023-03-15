import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { PrismaClient, UserRole } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import {
  ChangeMylistShareRangeSucceededPayload,
  MutationAuthenticationError,
  MutationInvalidMylistIdError,
  MutationMylistNotFoundError,
  MutationWrongMylistHolderError,
  Mylist,
  MylistShareRange,
  typeDefs,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers } from "../../index.js";
import { ResolverDeps } from "../../types.js";
import { ServerContext, UserContext } from "../../types.js";

describe("Mutation.changeMylistShareRange e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: ResolverDeps["config"];
  let token: ResolverDeps["token"];

  let executor: SyncExecutor<unknown, HTTPExecutorOptions>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME, process.env.TEST_NEO4J_PASSWORD)
    );

    logger = mockDeep<ResolverDeps["logger"]>();
    config = mockDeep<ResolverDeps["config"]>();
    token = mockDeep<ResolverDeps["token"]>();

    const schema = createSchema({ typeDefs, resolvers: makeResolvers({ prisma, neo4j, logger, config, token }) });
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

  test("MutationAuthenticationError", async () => {
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
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ChangeMylistShareRange_Scenario_1($input: ChangeMylistShareRangeInput!) {
          changeMylistShareRange(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationInvalidMylistIdError {
              mylistId
            }
            ... on MutationMylistNotFoundError {
              mylistId
            }
            ... on MutationWrongMylistHolderError {
              mylistId
            }
            ... on ChangeMylistShareRangeOtherErrorsFallback {
              message
            }
            ... on ChangeMylistShareRangeSucceededPayload {
              mylist {
                id
                range
              }
            }
          }
        }
      `),
      variables: { input: { mylistId: "m1", range: MylistShareRange.KnowLink } },
      context: { user: null },
    });

    expect(requestResult.data).toStrictEqual({
      changeMylistShareRange: {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies MutationAuthenticationError,
    });
  });

  test("MutationInvalidMylistIdError", async () => {
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
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ChangeMylistShareRange_Scenario_1($input: ChangeMylistShareRangeInput!) {
          changeMylistShareRange(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationInvalidMylistIdError {
              mylistId
            }
            ... on MutationMylistNotFoundError {
              mylistId
            }
            ... on MutationWrongMylistHolderError {
              mylistId
            }
            ... on ChangeMylistShareRangeOtherErrorsFallback {
              message
            }
            ... on ChangeMylistShareRangeSucceededPayload {
              mylist {
                id
                range
              }
            }
          }
        }
      `),
      variables: {
        input: {
          mylistId: "m1", // wrong
          range: MylistShareRange.KnowLink,
        },
      },
      context: { user: { id: "u1", role: UserRole.NORMAL } },
    });

    expect(requestResult.data).toStrictEqual({
      changeMylistShareRange: {
        __typename: "MutationInvalidMylistIdError",
        mylistId: "m1",
      } satisfies MutationInvalidMylistIdError,
    });
  });

  test("MutationMylistNotFoundError", async () => {
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
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ChangeMylistShareRange_Scenario_1($input: ChangeMylistShareRangeInput!) {
          changeMylistShareRange(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationInvalidMylistIdError {
              mylistId
            }
            ... on MutationMylistNotFoundError {
              mylistId
            }
            ... on MutationWrongMylistHolderError {
              mylistId
            }
            ... on ChangeMylistShareRangeOtherErrorsFallback {
              message
            }
            ... on ChangeMylistShareRangeSucceededPayload {
              mylist {
                id
                range
              }
            }
          }
        }
      `),
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m2"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: { user: { id: "u1", role: UserRole.NORMAL } },
    });

    expect(requestResult.data).toStrictEqual({
      changeMylistShareRange: {
        __typename: "MutationMylistNotFoundError",
        mylistId: "m2",
      } satisfies MutationMylistNotFoundError,
    });
  });

  test("MutationWrongMylistHolderError", async () => {
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
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ChangeMylistShareRange_Scenario_1($input: ChangeMylistShareRangeInput!) {
          changeMylistShareRange(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationInvalidMylistIdError {
              mylistId
            }
            ... on MutationMylistNotFoundError {
              mylistId
            }
            ... on MutationWrongMylistHolderError {
              mylistId
            }
            ... on ChangeMylistShareRangeOtherErrorsFallback {
              message
            }
            ... on ChangeMylistShareRangeSucceededPayload {
              mylist {
                id
                range
              }
            }
          }
        }
      `),
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m1"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: { user: { id: "u2", role: UserRole.NORMAL } },
    });

    expect(requestResult.data).toStrictEqual({
      changeMylistShareRange: {
        __typename: "MutationWrongMylistHolderError",
        mylistId: "m1",
      } satisfies MutationWrongMylistHolderError,
    });
  });

  test("ChangeMylistShareRangeSucceededPayload", async () => {
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
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          shareRange: MylistShareRange.Private,
        },
      }),
    ]);

    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation ChangeMylistShareRange_Scenario_1($input: ChangeMylistShareRangeInput!) {
          changeMylistShareRange(input: $input) {
            __typename
            ... on MutationAuthenticationError {
              requiredRole
            }
            ... on MutationInvalidMylistIdError {
              mylistId
            }
            ... on MutationMylistNotFoundError {
              mylistId
            }
            ... on MutationWrongMylistHolderError {
              mylistId
            }
            ... on ChangeMylistShareRangeOtherErrorsFallback {
              message
            }
            ... on ChangeMylistShareRangeSucceededPayload {
              mylist {
                id
                range
              }
            }
          }
        }
      `),
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m1"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: { user: { id: "u1", role: UserRole.NORMAL } },
    });

    expect(requestResult.data).toStrictEqual({
      changeMylistShareRange: {
        __typename: "ChangeMylistShareRangeSucceededPayload",
        mylist: {
          id: buildGqlId("Mylist", "m1"),
          range: MylistShareRange.KnowLink,
        } as Mylist,
      } satisfies ChangeMylistShareRangeSucceededPayload,
    });
  });
});
