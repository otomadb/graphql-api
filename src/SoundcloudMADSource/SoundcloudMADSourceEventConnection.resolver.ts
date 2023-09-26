import { MkResolver } from "../utils/MkResolver.js";
import { SoundcloudMADSourceEventDTO } from "./SoundcloudMADSourceEvent.dto.js";

export const resolverSoundcloudMADSourceEventConnection: MkResolver<"SoundcloudMADSourceEventConnection"> = () => ({
  nodes: ({ nodes }) => nodes.map((v) => SoundcloudMADSourceEventDTO.fromPrisma(v)),
  edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: SoundcloudMADSourceEventDTO.fromPrisma(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
