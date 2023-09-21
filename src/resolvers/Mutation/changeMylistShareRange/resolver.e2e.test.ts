import { PrismaClient } from "@prisma/client";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { graphql } from "../../../gql/gql.js";
import typeDefs from "../../../schema.graphql";
import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { makeExecutor } from "../../../test/makeExecutor.js";
import {
  ChangeMylistShareRangeSucceededPayload,
  MutationInvalidMylistIdError,
  MutationMylistNotFoundError,
  MutationWrongMylistHolderError,
  Mylist,
  MylistShareRange,
} from "../../graphql.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers } from "../../index.js";
import { CurrentUser, ResolverDeps, ServerContext, UserContext } from "../../types.js";

const Mutation = graphql(`
  mutation E2E_ChangeMylistShareRange($input: ChangeMylistShareRangeInput!) {
    changeMylistShareRange(input: $input) {
      __typename
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
`);
describe("Mutation.changeMylistShareRange e2e", () => {
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
    mockReset(otherMocks);
  });

  test("MutationInvalidMylistIdError", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          slug: "mylist-1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: Mutation,
      variables: {
        input: {
          mylistId: "m1", // wrong
          range: MylistShareRange.KnowLink,
        },
      },
      context: {
        currentUser: { id: "u1", scopes: ["edit:mylist"] } satisfies CurrentUser,
      },
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
        },
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          slug: "mylist-1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: Mutation,
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m2"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: {
        currentUser: { id: "u1", scopes: ["edit:mylist"] } satisfies CurrentUser,
      },
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
        },
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          slug: "mylist-1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: Mutation,
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m1"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: {
        currentUser: { id: "u2", scopes: ["edit:mylist"] } satisfies CurrentUser,
      },
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
        },
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          shareRange: MylistShareRange.Private,
          slug: "mylist-1",
        },
      }),
    ]);

    const requestResult = await executor({
      document: Mutation,
      variables: {
        input: {
          mylistId: buildGqlId("Mylist", "m1"),
          range: MylistShareRange.KnowLink,
        },
      },
      context: {
        currentUser: { id: "u1", scopes: ["edit:mylist"] } satisfies CurrentUser,
      },
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
