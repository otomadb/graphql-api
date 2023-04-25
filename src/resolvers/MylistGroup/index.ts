import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../types.js";
import { resolveMylists } from "./mylists.js";
import { resolverMylistGroupVideo } from "./videos/resolver.js";

export const resolveMylistGroup = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "prisma" | "userRepository" | "logger">) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroup", id),

    holder: async ({ holderId }) => userRepository.getById(holderId),

    mylists: resolveMylists({ prisma, logger }),
    videos: resolverMylistGroupVideo({ prisma }),
  } satisfies Resolvers["MylistGroup"]);
