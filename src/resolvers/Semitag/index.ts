import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
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
    async resolvedTag({ videoTagId }) {
      if (!videoTagId) return null;
      return prisma.videoTag
        .findFirstOrThrow({ where: { id: videoTagId }, include: { tag: true } })
        .then((v) => new TagModel(v.tag))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", videoTagId); // # TODO: 全然嘘;
        });
    },
  } satisfies Resolvers["Semitag"]);
