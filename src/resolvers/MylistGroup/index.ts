import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { resolveMylists } from "./mylists.js";
import { resolverMylistGroupVideo } from "./videos/resolver.js";

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
    videos: resolverMylistGroupVideo({ prisma }),
  } satisfies Resolvers["MylistGroup"]);
