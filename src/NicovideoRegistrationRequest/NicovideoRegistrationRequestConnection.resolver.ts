import { Resolvers } from "../resolvers/graphql.js";
import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const resolverNicovideoRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => NicovideoRegistrationRequestDTO.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: NicovideoRegistrationRequestDTO.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  } satisfies Resolvers["NicovideoRegistrationRequestConnection"]);
