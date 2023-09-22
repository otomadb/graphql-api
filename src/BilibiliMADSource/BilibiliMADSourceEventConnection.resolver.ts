import { MkResolver } from "../utils/MkResolver.js";
import { BilibiliMADSourceEventDTO } from "./BilibiliMADSourceEvent.dto.js";

export const resolverBilibiliMADSourceEventConnection: MkResolver<"BilibiliMADSourceEventConnection"> = () => ({
  nodes: ({ nodes }) => nodes.map((v) => BilibiliMADSourceEventDTO.fromPrisma(v)),
  edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: BilibiliMADSourceEventDTO.fromPrisma(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
