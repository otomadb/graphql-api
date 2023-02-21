import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupMylistInclusionModel } from "../../MylistGroupMylistInclusion/model.js";

export const addMylistToMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { mylistId: mylistGqlId, groupId: groupGqlId } }, { user: ctxUser }) => {
    if (!ctxUser?.id) throw new GraphQLError("you must be logged in");

    const mylistId = parseGqlID("Mylist", mylistGqlId);
    const groupId = parseGqlID("MylistGroup", groupGqlId);

    const inc = await prisma.mylistGroupMylistInclsion.create({
      data: {
        id: ulid(),
        groupId,
        mylistId,
      },
    });
    return { inclusion: new MylistGroupMylistInclusionModel(inc) };
  }) satisfies MutationResolvers["addMylistToMylistGroup"];
