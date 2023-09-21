import { Resolvers } from "../resolvers/graphql.js";
import { YoutubeVideoSourceEventDTO } from "./dto.js";

export const resolverYoutubeVideoSourceEventConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => YoutubeVideoSourceEventDTO.fromPrisma(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: YoutubeVideoSourceEventDTO.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["YoutubeVideoSourceEventConnection"];
