import { Resolvers } from "../resolvers/graphql.js";
import { NotificationDTO } from "./Notification.dto.js";

export const resolverNotificationConnection = () =>
  ({
    nodes: ({ nodes }) => nodes.map((v) => NotificationDTO.fromPrisma(v)),
    edges: ({ edges }) => edges.map((e) => ({ cursor: e.cursor, node: NotificationDTO.fromPrisma(e.node) })),
    pageInfo: ({ pageInfo }) => pageInfo,
    totalCount: ({ totalCount }) => totalCount,
  }) satisfies Resolvers["NotificationConnection"];
