import { Resolvers } from "../resolvers/graphql.js";
import { VideoTagDTO } from "./dto.js";

export const resolverVideoTagConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => new VideoTagDTO(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new VideoTagDTO(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["VideoTagConnection"]);
