import { IncomingMessage, ServerResponse } from "node:http";

import { User } from "@prisma/client";

export type ServerContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type UserContext = {
  userId: User["id"] | null;
  user: {
    id: User["id"];
    role: User["role"];
  } | null;
};

export type Context = UserContext & ServerContext;
