import { Resolvers } from "../graphql.js";
import { NotificationModel } from "../Notification/model.js";

export const resolverNotificationConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => NotificationModel.fromPrisma(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: NotificationModel.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["NotificationConnection"];
