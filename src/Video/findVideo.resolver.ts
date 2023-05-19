import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO } from "./dto.js";

const schema = z.union([z.object({ id: z.string() }), z.object({ serial: z.number() })]);

export const resolverFindVideo = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: unparsedInput }, { currentUser: ctxUser }, info) => {
    const parsed = schema.safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;

    if ("id" in input) {
      const v = await prisma.video.findFirst({ where: { id: input.id } });
      if (!v) {
        logger.info({ path: info.path, id: input.id, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new VideoDTO(v);
    } else {
      const v = await prisma.video.findFirst({ where: { serial: input.serial } });
      if (!v) {
        logger.info({ path: info.path, serial: input.serial, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new VideoDTO(v);
    }
  }) satisfies QueryResolvers["findVideo"];
