import { Resolvers } from "../graphql.js";
import { TagParentModel } from "../TagParent/model.js";

export const resolverTagParentConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new TagParentModel(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new TagParentModel(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["TagParentConnection"]);
