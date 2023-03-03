import { Resolvers } from "../graphql.js";
import { VideoModel } from "../Video/model.js";

export const resolverVideoConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new VideoModel(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new VideoModel(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["VideoConnection"]);
