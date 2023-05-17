import { Resolvers } from "../graphql.js";
import { SoundcloudVideoSourceEventModel } from "../SoundcloudVideoSourceEvent/model.js";

export const resolverSoundcloudVideoSourceEventConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => SoundcloudVideoSourceEventModel.fromPrisma(v)),
    edges: ({ edges }) =>
      edges.map((e) => ({ cursor: e.cursor, node: SoundcloudVideoSourceEventModel.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["SoundcloudVideoSourceEventConnection"]);
