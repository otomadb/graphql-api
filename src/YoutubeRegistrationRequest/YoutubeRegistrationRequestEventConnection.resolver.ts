import { MkResolver } from "../utils/MkResolver.js";

export const mkYoutubeRegistrationRequestEventConnectionResolver: MkResolver<
  "YoutubeRegistrationRequestEventConnection",
  "YoutubeRegistrationRequestEventService"
> = ({ YoutubeRegistrationRequestEventService }) => ({
  nodes: ({ nodes }) => nodes.map((v) => YoutubeRegistrationRequestEventService.switchit(v)),
  edges: ({ edges }) =>
    edges.map((e) => ({ cursor: e.cursor, node: YoutubeRegistrationRequestEventService.switchit(e.node) })),
  pageInfo: ({ pageInfo }) => pageInfo,
  totalCount: ({ totalCount }) => totalCount,
});
