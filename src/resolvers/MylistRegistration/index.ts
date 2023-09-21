import { VideoDTO } from "../../Video/dto.js";
import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { MylistModel } from "../Mylist/model.js";
import { ResolverDeps } from "../types.js";

export const resolveMylistRegistration = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("MylistRegistration", id),
    mylist: async ({ mylistId }) =>
      prisma.mylist
        .findUniqueOrThrow({ where: { id: mylistId } })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", mylistId);
        }),
    video: async ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
  }) satisfies Resolvers["MylistRegistration"];
