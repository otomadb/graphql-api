import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { TagModel } from "../resolvers/Tag/model.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoTagEventDTO } from "./dto.js";
import { VideoDTO } from "./dto.js";

export const resolveVideoTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("VideoThumbnail", id),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    tag: ({ tagId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),

    events: async ({ id }, { input }) => {
      const nodes = await prisma.videoTagEvent
        .findMany({
          where: { videoTagId: id },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new VideoTagEventDTO(e)));
      return { nodes };
    },
  } satisfies Resolvers["VideoTag"]);
