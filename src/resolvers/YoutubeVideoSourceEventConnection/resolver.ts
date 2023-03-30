import { Resolvers } from "../graphql.js";
import { YoutubeVideoSourceEventModel } from "../YoutubeVideoSourceEvent/model.js";

export const resolverYoutubeVideoSourceEventConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => YoutubeVideoSourceEventModel.fromPrisma(v)),
    edges: ({ edges }) =>
      edges.map((e) => ({ cursor: e.cursor, node: YoutubeVideoSourceEventModel.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["YoutubeVideoSourceEventConnection"]);
