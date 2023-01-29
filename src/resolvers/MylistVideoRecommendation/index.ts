import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistVideoRecommendation = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    origin: ({ originMylistId }) =>
      prisma.mylist
        .findUniqueOrThrow({ where: { id: originMylistId } })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", originMylistId);
        }),
    to: ({ toVideoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: toVideoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", toVideoId);
        }),
  } satisfies Resolvers["MylistVideoRecommendation"]);
