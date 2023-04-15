import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";

const schema = z.union([z.object({ id: z.string() }), z.object({ serial: z.number() })]);

export const findTag = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
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
      return new TagModel(t);
    } else {
      const t = await prisma.tag.findFirst({ where: { serial: input.serial } });
      if (!t) {
        logger.info({ path: info.path, serial: input.serial, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new TagModel(t);
    }
  }) satisfies QueryResolvers["findTag"];
