import { User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export type ServerContext = {
  req: FastifyRequest;
  reply: FastifyReply;
};

export type UserContext = {
  userId: User["id"] | null;
};

export type Context = UserContext & ServerContext;
