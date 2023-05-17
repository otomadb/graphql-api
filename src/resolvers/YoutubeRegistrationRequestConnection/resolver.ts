import { Resolvers } from "../graphql.js";
import { YoutubeRegistrationRequestModel } from "../YoutubeRegistrationRequest/model.js";

export const resolverYoutubeRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => YoutubeRegistrationRequestModel.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: YoutubeRegistrationRequestModel.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["YoutubeRegistrationRequestConnection"]);
