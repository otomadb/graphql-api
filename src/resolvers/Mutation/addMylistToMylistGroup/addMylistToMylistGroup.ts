import { UserRole } from "@prisma/client";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupMylistInclusionModel } from "../../MylistGroupMylistInclusion/model.js";

export const addMylistToMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input: { mylistId: mylistGqlId, groupId: groupGqlId } }) => {
    const mylistId = parseGqlID("Mylist", mylistGqlId);
    const groupId = parseGqlID("MylistGroup", groupGqlId);

    const inc = await prisma.mylistGroupMylistInclsion.create({ data: { groupId, mylistId } });
    return { inclusion: new MylistGroupMylistInclusionModel(inc) };
  }) satisfies MutationResolvers["addMylistToMylistGroup"];
