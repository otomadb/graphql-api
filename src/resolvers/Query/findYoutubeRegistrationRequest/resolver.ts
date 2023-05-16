import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { YoutubeRegistrationRequestModel } from "../../YoutubeRegistrationRequest/model.js";

export const resolverFindYoutubeRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: unparsedInput }, { currentUser: ctxUser }, info) => {
    const parsed = z.union([z.object({ id: z.string() }), z.object({ sourceId: z.string() })]).safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;
    if ("id" in input) {
      const req = await prisma.youtubeRegistrationRequest.findUnique({
        where: { id: parseGqlID("YoutubeRegistrationRequest", input.id) },
      });
      if (!req) {
        logger.info({ path: info.path, id: input.id, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return YoutubeRegistrationRequestModel.fromPrisma(req);
    } else {
      const req = await prisma.youtubeRegistrationRequest.findUnique({
        where: { sourceId: input.sourceId },
      });
      if (!req) {
        logger.info({ path: info.path, sourceId: input.sourceId, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return YoutubeRegistrationRequestModel.fromPrisma(req);
    }
  }) satisfies QueryResolvers["findYoutubeRegistrationRequest"];
