import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { resolveMylists } from "./mylists.js";
import { resolverMylistGroupVideo } from "./videos/resolver.js";

export const resolveMylistGroup = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroup", id),

    holder: async ({ holderId }) => UserModel.fromAuth0({ auth0Management, logger }, holderId),

    mylists: resolveMylists({ prisma }),
    videos: resolverMylistGroupVideo({ prisma }),
  } satisfies Resolvers["MylistGroup"]);
