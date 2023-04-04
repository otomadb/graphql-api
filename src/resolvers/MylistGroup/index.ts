import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { resolveMylists } from "./mylists.js";
import { resolverMylistGroupVideo } from "./videos/resolver.js";

export const resolveMylistGroup = ({ prisma, auth0Management }: Pick<ResolverDeps, "prisma" | "auth0Management">) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroup", id),

    holder: async ({ holderId }) => UserModel.fromAuth0User(await auth0Management.getUser({ id: holderId })),

    mylists: resolveMylists({ prisma }),
    videos: resolverMylistGroupVideo({ prisma }),
  } satisfies Resolvers["MylistGroup"]);
