import { MkResolver } from "../utils/MkResolver.js";

export const mkNicovideoRegistrationRequestEventConnectionResolver: MkResolver<
  "NicovideoRegistrationRequestEventConnection",
  "NicovideoRegistrationRequestEventService"
> = ({ NicovideoRegistrationRequestEventService }) => ({
  nodes: ({ nodes }) => nodes.map((v) => NicovideoRegistrationRequestEventService.switchit(v)),
  edges: ({ edges }) =>
    edges.map((e) => ({ cursor: e.cursor, node: NicovideoRegistrationRequestEventService.switchit(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
