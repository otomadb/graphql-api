import { QueryResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const user = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.user
      .findUniqueOrThrow({ where: { id: parseGqlID("User", id) } })
      .then((v) => new UserModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("User", id);
      })) satisfies QueryResolvers["user"];
