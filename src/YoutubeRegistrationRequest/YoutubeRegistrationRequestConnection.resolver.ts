import { Resolvers } from "../resolvers/graphql.js";
import { YoutubeRegistrationRequestDTO } from "./dto.js";

export const resolverYoutubeRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => YoutubeRegistrationRequestDTO.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: YoutubeRegistrationRequestDTO.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["YoutubeRegistrationRequestConnection"]);
