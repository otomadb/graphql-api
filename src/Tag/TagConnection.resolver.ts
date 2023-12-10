import { MkResolver } from "../utils/MkResolver.js";
import { TagDTO } from "./dto.js";

export const mkTagConnectionResolver: MkResolver<"TagConnection"> = () => ({
  nodes: ({ nodes }) => nodes.map((v) => new TagDTO(v)),
  edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: new TagDTO(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
