import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { parseSortOrder } from "../../parseSortOrder.js";

export const findNicovideoRegistrationRequests = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input }) => {
    const semitags = await prisma.nicovideoRegistrationRequest.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parseSortOrder(input.order?.createdAt),
      },
      where: {
        isChecked: input.checked?.valueOf(),
      },
    });
    return { nodes: semitags.map((t) => new NicovideoRegistrationRequestModel(t)) };
  }) satisfies QueryResolvers["findNicovideoRegistrationRequests"];
