import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO } from "./dto.js";

export const resolveVideoSimilarity = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    origin: ({ originId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: originId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", originId);
        }),
    to: ({ toId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: toId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", toId);
        }),
  }) satisfies Resolvers["VideoSimilarity"];
