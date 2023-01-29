import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { VideoModel } from "../Video/model.js";

export const resolveVideoSimilarity = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    origin: ({ originId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: originId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", originId);
        }),
    to: ({ toId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: toId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", toId);
        }),
  } satisfies Resolvers["VideoSimilarity"]);
