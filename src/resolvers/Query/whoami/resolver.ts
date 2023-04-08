import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const resolverWhoami = ({ auth0Management, logger }: Pick<ResolverDeps, "auth0Management" | "logger">) =>
  (async (_parent, _args, { currentUser }) =>
    UserModel.fromAuth0({ auth0Management, logger }, currentUser.id).catch(() => {
      throw new GraphQLError("Internal server error");
    })) satisfies QueryResolvers["whoami"];
