import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const resolverWhoami = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  (async (_parent, _args, { currentUser }, info) => {
    try {
      const user = await auth0Management.getUser({ id: currentUser.id });

      await prisma.user.upsert({ where: { id: currentUser.id }, update: {}, create: { id: currentUser.id } });

      return UserModel.fromAuth0User(user);
    } catch (error) {
      logger.error({ error, path: info.path, currentUser }, "Internal server error");
      throw new GraphQLError("Internal server error");
    }
  }) satisfies QueryResolvers["whoami"];
