import { Resolvers } from "../resolvers/graphql.js";
import { SoundcloudRegistrationRequestDTO } from "./SoundcloudRegistrationRequest.dto.js";

export const resolverSoundcloudRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => SoundcloudRegistrationRequestDTO.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: SoundcloudRegistrationRequestDTO.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["SoundcloudRegistrationRequestConnection"];
