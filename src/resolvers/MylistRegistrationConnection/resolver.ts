import { Resolvers } from "../graphql.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";

export const resolverMylistRegistrationConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((n) => MylistRegistrationModel.fromPrisma(n)),
    edges: ({ edges }) =>
      edges.map(({ cursor, node }) => ({
        cursor,
        node: MylistRegistrationModel.fromPrisma(node),
      })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["MylistRegistrationConnection"];
