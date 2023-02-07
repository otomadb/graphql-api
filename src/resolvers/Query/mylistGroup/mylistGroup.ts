import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";

export const mylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.mylistGroup
      .findUniqueOrThrow({ where: { id: parseGqlID("MylistGroup", id) } })
      .then((v) => new MylistGroupModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("MylistGroup", id);
      })) satisfies QueryResolvers["mylistGroup"];
