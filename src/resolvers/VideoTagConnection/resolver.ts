import { Resolvers } from "../graphql.js";
import { VideoTagModel } from "../VideoTag/model.js";

export const resolverVideoTagConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new VideoTagModel(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new VideoTagModel(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["VideoTagConnection"]);
