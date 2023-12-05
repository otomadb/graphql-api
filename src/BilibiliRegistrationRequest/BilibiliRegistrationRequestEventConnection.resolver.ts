import { MkResolver } from "../utils/MkResolver.js";

export const mkBilibiliRegistrationRequestEventConnectionResolver: MkResolver<
  "BilibiliRegistrationRequestEventConnection",
  "BilibiliRegistrationRequestEventService"
> = ({ BilibiliRegistrationRequestEventService }) => ({
  nodes: ({ nodes }) => nodes.map((v) => BilibiliRegistrationRequestEventService.switchit(v)),
  edges: ({ edges }) =>
    edges.map((e) => ({ cursor: e.cursor, node: BilibiliRegistrationRequestEventService.switchit(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
