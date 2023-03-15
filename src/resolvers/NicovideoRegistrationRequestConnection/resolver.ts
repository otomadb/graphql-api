import { Resolvers } from "../graphql.js";
import { NicovideoRegistrationRequestModel } from "../NicovideoRegistrationRequest/model.js";

export const resolverNicovideoRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => NicovideoRegistrationRequestModel.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: NicovideoRegistrationRequestModel.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["NicovideoRegistrationRequestConnection"]);
