import { GraphQLError } from "graphql";

import { MutationResolvers } from "../../graphql.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";
import { ResolverDeps } from "../../types.js";

export const createMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }, { user: ctxUser }) => {
    if (!ctxUser) throw new GraphQLError("you must be logged in"); // TODO: must be error payload

    const group = await prisma.mylistGroup.create({
      data: { title: input.title, holderId: ctxUser.id },
    });

    return {
      group: new MylistGroupModel(group),
    };
  }) satisfies MutationResolvers["createMylistGroup"];
