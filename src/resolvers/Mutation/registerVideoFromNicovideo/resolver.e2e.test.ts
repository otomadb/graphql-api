import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { createSchema, createYoga } from "graphql-yoga";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";

import { graphql } from "../../../gql/gql.js";
import typeDefs from "../../../schema.graphql";
import { RegisterVideoFromNicovideoInput, RegisterVideoFromNicovideoSemitagTooLongError } from "../../graphql.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers } from "../../index.js";
import { CurrentUser, ResolverDeps, ServerContext, UserContext } from "../../types.js";

const Mutation = graphql(`
  mutation E2E_RegisterVideoFromNicovideo($input: RegisterVideoFromNicovideoInput!) {
    registerVideoFromNicovideo(input: $input) {
      __typename
      ... on RegisterVideoFromNicovideoSemitagTooLongError {
        name
      }
    }
  }
`);
describe("Mutation.registerVideoFromNicovideo e2e", () => {
  describe("Args and Return check", () => {
    let deps: DeepMockProxy<ResolverDeps>;
    let executor: SyncExecutor<unknown, HTTPExecutorOptions>;

    beforeAll(async () => {
      deps = mockDeep<ResolverDeps>();

      const schema = createSchema({
        typeDefs,
        resolvers: makeResolvers(deps),
      });
      const yoga = createYoga<ServerContext, UserContext>({ schema });
      executor = buildHTTPExecutor({ fetch: yoga.fetch });
    });

    beforeEach(async () => {
      mockReset(deps);
    });

    test.each([
      [
        {
          primaryTitle: "primaryTitle",
          extraTitles: ["extraTitle1", "extraTitle2"],
          primaryThumbnailUrl: "primaryThumbnail",
          tagIds: [buildGqlId("Tag", "t1"), buildGqlId("Tag", "t2")],
          semitagNames: ["st1", "toolongtoolongtoolongtoolongtoolongtoolong"],
          sourceIds: ["sm2057168"],
          requestId: null,
        } satisfies RegisterVideoFromNicovideoInput,
        {
          __typename: "RegisterVideoFromNicovideoSemitagTooLongError",
          name: "toolongtoolongtoolongtoolongtoolongtoolong",
        } satisfies RegisterVideoFromNicovideoSemitagTooLongError,
      ],
    ])("不適当なinput: %#", async (input, expected) => {
      const requestResult = await executor({
        document: Mutation,
        variables: { input },
        context: {
          currentUser: {
            id: "u1",
            scopes: ["create:video"],
          } satisfies CurrentUser,
        },
      });

      expect(requestResult.data.registerVideoFromNicovideo).toStrictEqual(expected);
    });
  });
});
