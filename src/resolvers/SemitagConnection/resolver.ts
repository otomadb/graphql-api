import { Resolvers } from "../graphql.js";
import { SemitagModel } from "../Semitag/model.js";

export const resolverSemitagConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new SemitagModel(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new SemitagModel(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["SemitagConnection"]);
