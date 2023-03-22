import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistGroupVideoAggregation = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    /*
    mylists: ({ mylistIds }, { input }) =>
      prisma.mylist
        .findMany({
          where: { id: { in: mylistIds } },
          orderBy: {
            // TODO: Prisma
            createdAt: "asc",

            createdAt: input.order.createdAt || undefined,
            updatedAt: input.order.updatedAt || undefined,

          },
          take: input.limit,
          skip: input.skip,
        })
        .then((ls) => ls.map((l) => new MylistModel(l))),
    count: ({ mylistIds }) => mylistIds.length,
    */
  } satisfies Resolvers["MylistGroupVideoAggregation"]);
