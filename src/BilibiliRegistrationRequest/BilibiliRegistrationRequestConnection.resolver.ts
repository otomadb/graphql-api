import { Resolvers } from "../resolvers/graphql.js";
import { BilibiliRegistrationRequestDTO } from "./BilibiliRegistrationRequest.dto.js";

export const resolverBilibiliRegistrationRequestConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => BilibiliRegistrationRequestDTO.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: BilibiliRegistrationRequestDTO.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["BilibiliRegistrationRequestConnection"];
