import { Resolvers } from "../resolvers/graphql.js";
import { SoundcloudVideoSourceEventDTO } from "./dto.js";

export const resolverSoundcloudVideoSourceEventConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => SoundcloudVideoSourceEventDTO.fromPrisma(v)),
    edges: ({ edges }) =>
      edges.map((e) => ({ cursor: e.cursor, node: SoundcloudVideoSourceEventDTO.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["SoundcloudVideoSourceEventConnection"];
