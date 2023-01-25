import { QueryResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const video = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.video
      .findUniqueOrThrow({ where: { id: parseGqlID("Video", id) } })
      .then((v) => new VideoModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("Video", id);
      })) satisfies QueryResolvers["video"];
