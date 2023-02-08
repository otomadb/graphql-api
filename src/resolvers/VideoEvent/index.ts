import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { UserModel } from "../User/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveVideoEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    __resolveType({ type }) {
      switch (type) {
        case "REGISTER":
          return "VideoRegisterEvent";
        // title
        case "ADD_TITLE":
          return "VideoAddTitleEvent";
        case "REMOVE_TITLE":
          return "VideoRemoveTitleEvent";
        case "SET_PRIMARY_TITLE":
          return "VideoSetPrimaryTitleEvent";
        // thumbnail
        case "ADD_THUMBNAIL":
          return "VideoAddThumbnailEvent";
        case "REMOVE_THUMBNAIL":
          return "VideoRemoveThumbnailEvent";
        case "SET_PRIMARY_THUMBNAIL":
          return "VideoSetPrimaryThumbnailEvent";
        // tag
        case "ADD_TAG":
          return "VideoAddTagEvent";
        // semitag
        case "ADD_SEMITAG":
          return "VideoAddSemitagEvent";
        // nicovideo source
        case "ADD_NICOVIDEO_SOURCE":
          return "VideoAddNicovideoSourceEvent";
        default:
          throw new GraphQLError(`Unsupport VideoEvent type: ${type}`);
      }
    },
  } satisfies Resolvers["VideoEvent"]);
