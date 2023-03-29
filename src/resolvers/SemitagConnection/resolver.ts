import { Resolvers } from "../graphql.js";
import { SemitagModel } from "../Semitag/model.js";

export const resolverSemitagConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => SemitagModel.fromPrisma(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: SemitagModel.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["SemitagConnection"]);
