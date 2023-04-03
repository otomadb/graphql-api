import { IncomingMessage, ServerResponse } from "node:http";

import { PrismaClient } from "@prisma/client";
import { MeiliSearch } from "meilisearch";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  meilisearch: MeiliSearch;
  logger: Logger;
};
export type ServerContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type CurrentUser = {
  id: string;
  permissions: string[];
};
export type UserContext = {
  currentUser: CurrentUser;
};

export type Context = ServerContext & UserContext;
