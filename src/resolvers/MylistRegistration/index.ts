import { Resolvers } from "../../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

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
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
  } satisfies Resolvers["MylistRegistration"]);
