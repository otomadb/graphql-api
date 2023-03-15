import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverFindNicovideoRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: unparsedInput }, { user: ctxUser }, info) => {
    const parsed = z.union([z.object({ id: z.string() }), z.object({ sourceId: z.string() })]).safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;
    if ("id" in input) {
      const req = await prisma.nicovideoRegistrationRequest.findUniqueOrThrow({
        where: { id: parseGqlID("NicovideoRegistrationRequest", input.id) },
      });
      if (!req) {
        logger.warn({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new NicovideoRegistrationRequestModel(req);
    } else {
      const req = await prisma.nicovideoRegistrationRequest.findUniqueOrThrow({
        where: { sourceId: input.sourceId },
      });
      if (!req) {
        logger.warn({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new NicovideoRegistrationRequestModel(req);
    }
  }) satisfies QueryResolvers["findNicovideoRegistrationRequest"];
