import { MylistGroupResolvers } from "../../graphql.js";
import { MylistGroupVideoAggregationModel } from "../../MylistGroupVideoAggregation/model.js";
import { ResolverDeps } from "../../types.js";
import { getVideos } from "./prisma.js";

export const resolverMylistGroupVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: groupId }, { input }) => {
    const result = await getVideos(prisma, { groupId, limit: input.limit, skip: input.skip });
    return result.map(({ count, videoId }) => new MylistGroupVideoAggregationModel({ count, videoId }));
  }) satisfies MylistGroupResolvers["videos"];
