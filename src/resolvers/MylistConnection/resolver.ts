import { Resolvers } from "../graphql.js";
import { MylistModel } from "../Mylist/model.js";

export const resolverMylistConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new MylistModel(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new MylistModel(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["MylistConnection"]);
