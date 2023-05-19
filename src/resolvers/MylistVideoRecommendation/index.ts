import { VideoDTO } from "../../Video/dto.js";
import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { MylistModel } from "../Mylist/model.js";
import { ResolverDeps } from "../types.js";

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
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", toVideoId);
        }),
  } satisfies Resolvers["MylistVideoRecommendation"]);
