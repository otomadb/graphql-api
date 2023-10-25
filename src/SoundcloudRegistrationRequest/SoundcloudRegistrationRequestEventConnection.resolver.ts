import { MkResolver } from "../utils/MkResolver.js";

export const mkSoundcloudRegistrationRequestEventConnectionResolver: MkResolver<
  "SoundcloudRegistrationRequestEventConnection",
  "SoundcloudRegistrationRequestEventService"
> = ({ SoundcloudRegistrationRequestEventService }) => ({
  nodes: ({ nodes }) => nodes.map((v) => SoundcloudRegistrationRequestEventService.switchit(v)),
  edges: ({ edges }) =>
    edges.map((e) => ({ cursor: e.cursor, node: SoundcloudRegistrationRequestEventService.switchit(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
