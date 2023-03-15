import { IncomingMessage, ServerResponse } from "node:http";

import { PrismaClient, User } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { Logger } from "pino";

export type ResolverDeps = {
  prisma: PrismaClient;
  neo4j: Neo4jDriver;
  logger: Logger;
  config: {
    session: {
      cookieName(): string;
      cookieDomain(): string | undefined;
      cookieSameSite(): "none" | "strict";
    };
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
