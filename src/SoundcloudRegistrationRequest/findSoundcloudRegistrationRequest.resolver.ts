import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../resolvers/graphql.js";
import { parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudRegistrationRequestDTO } from "./SoundcloudRegistrationRequest.dto.js";

export const resolverFindSoundcloudRegistrationRequest = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: unparsedInput }, { currentUser: ctxUser }, info) => {
    const parsed = z.union([z.object({ id: z.string() }), z.object({ sourceId: z.string() })]).safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;
    if ("id" in input) {
      const req = await prisma.soundcloudRegistrationRequest.findUnique({
        where: { id: parseGqlID("SoundcloudRegistrationRequest", input.id) },
      });
      if (!req) {
        logger.info({ path: info.path, id: input.id, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return SoundcloudRegistrationRequestDTO.fromPrisma(req);
    } else {
      const req = await prisma.soundcloudRegistrationRequest.findUnique({
        where: { sourceId: input.sourceId },
      });
      if (!req) {
        logger.info({ path: info.path, sourceId: input.sourceId, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return SoundcloudRegistrationRequestDTO.fromPrisma(req);
    }
  }) satisfies QueryResolvers["findSoundcloudRegistrationRequest"];
