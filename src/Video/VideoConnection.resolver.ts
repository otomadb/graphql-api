import { Resolvers } from "../resolvers/graphql.js";
import { VideoDTO } from "./dto.js";

export const resolverVideoConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new VideoDTO(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new VideoDTO(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["VideoConnection"];
