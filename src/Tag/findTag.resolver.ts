import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

const schema = z.union([z.object({ id: z.string() }), z.object({ serial: z.number() })]);

export const resolverFindTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: unparsedInput }, { currentUser: ctxUser }, info) => {
    const parsed = schema.safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;

    if ("id" in input) {
      const t = await prisma.tag.findFirst({ where: { id: input.id } });
      if (!t) {
        logger.info({ path: info.path, id: input.id, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new TagDTO(t);
    } else {
      const t = await prisma.tag.findFirst({ where: { serial: input.serial } });
      if (!t) {
        logger.info({ path: info.path, serial: input.serial, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new TagDTO(t);
    }
  }) satisfies QueryResolvers["findTag"];
