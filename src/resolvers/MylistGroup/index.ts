import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { UserModel } from "../User/model.js";
import { resolveMylists } from "./mylists.js";
import { resolveMylistGroupVideo } from "./videos.js";

export const resolveMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroup", id),
    holder: ({ holderId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: holderId } })
        .then((v) => new UserModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", holderId);
        }),

    mylists: resolveMylists({ prisma }),
    videos: resolveMylistGroupVideo({ prisma }),
  } satisfies Resolvers["MylistGroup"]);
