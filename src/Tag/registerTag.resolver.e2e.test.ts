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
  mutation E2E_RegisterTag($input: RegisterTagInput!) {
    registerTag(input: $input) {
      __typename
      ... on MutationInvalidTagIdError {
        tagId
      }
      ... on MutationInvalidSemitagIdError {
        semitagId
      }
      ... on RegisterTagTagIdCollidedBetweenExplicitAndImplicitError {
        tagId
      }
      ... on RegisterTagImplicitParentIdsDuplicatedError {
        tagId
      }
      ... on RegisterTagResolveSemitagIdsDuplicatedError {
        semitagId
      }
    }
  }
`);
describe("Mutation.registerTag e2e", () => {
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

  test.each([
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: "t1",
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidTagIdError",
        tagId: "t1",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: ["t2", buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidTagIdError",
        tagId: "t2",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: ["st1", buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidSemitagIdError",
        semitagId: "st1",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagImplicitParentIdsDuplicatedError",
        tagId: buildGqlId("Tag", "t2"),
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagResolveSemitagIdsDuplicatedError",
        semitagId: buildGqlId("Semitag", "st1"),
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t1"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagTagIdCollidedBetweenExplicitAndImplicitError",
        tagId: buildGqlId("Tag", "t1"),
      },
    ],
  ])("不適当なinput: %#", async (input, expected) => {
    const result = await executor({
      operation: Mutation,
      variables: { input },
      context: {
        currentUser: {
          id: "u1",
          scopes: ["create:tag"],
        } satisfies CurrentUser,
      },
    });
    expect(result.data).toStrictEqual({
      registerTag: expected,
    });
  });
});
