import { Resolvers } from "../resolvers/graphql.js";
import { TagParentDTO } from "./dto.js";

export const resolverTagParentConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new TagParentDTO(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new TagParentDTO(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["TagParentConnection"]);
