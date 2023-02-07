import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const findUser = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { name } }) => {
    if (!name) throw new GraphQLError("name must be provided"); // TODO: error messsage

    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) throw new GraphQLError("Not Found");

    return new UserModel(user);
  }) satisfies QueryResolvers["findUser"];
