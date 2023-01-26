import { Resolvers } from "../../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveSemitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ dbId }): string => buildGqlId("Semitag", dbId),
    video: ({ videoId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    async resolvedTag({ tagId }) {
      if (!tagId) return null;
      return prisma.tag
        .findFirstOrThrow({ where: { id: tagId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        });
    },
  } satisfies Resolvers["Semitag"]);
