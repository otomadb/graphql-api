import { IncomingMessage, ServerResponse } from "node:http";

import { PrismaClient, User } from "@prisma/client";
import { MeiliSearch } from "meilisearch";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  meilisearch: MeiliSearch;
  logger: Logger;
  config: {
    session: {
      cookieName(): string;
      cookieDomain(): string | undefined;
      cookieSameSite(): "none" | "strict";
    };
  };
  token: {
    sign(payload: { userId: string; duration: "1d" | "3d" | "1w" | "1m" }): string;
  };
};

export type ServerContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type UserContext = {
  user: {
    id: User["id"];
    role: User["role"];
  } | null;
};

export type Context = UserContext & ServerContext;
