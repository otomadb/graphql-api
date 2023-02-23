import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";

export const resolverFindNicovideoRegistrationRequest = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input: unparsedInput }) => {
    const parsed = z.union([z.object({ id: z.string() }), z.object({ sourceId: z.string() })]).safeParse(unparsedInput);
    if (!parsed.success) throw new GraphQLError("Argument 'input' is invalid.");

    const input = parsed.data;
    if ("id" in input) {
      const req = await prisma.nicovideoRegistrationRequest.findUniqueOrThrow({
        where: { id: parseGqlID("NicovideoRegistrationRequest", input.id) },
      });
      if (!req) return null;
      return new NicovideoRegistrationRequestModel(req);
    } else {
      const req = await prisma.nicovideoRegistrationRequest.findUniqueOrThrow({
        where: { sourceId: input.sourceId },
      });
      if (!req) return null;
      return new NicovideoRegistrationRequestModel(req);
    }
  }) satisfies QueryResolvers["findNicovideoRegistrationRequest"];
