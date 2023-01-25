import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupMylistInclusionModel } from "../../MylistGroupMylistInclusion/model.js";

export const addMylistToMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input: { mylistId: mylistGqlId, groupId: groupGqlId } }) => {
    const mylistId = parseGqlID("Mylist", mylistGqlId);
    const groupId = parseGqlID("MylistGroup", groupGqlId);

    const inclusion = new MylistGroupMylistInclusion();
    inclusion.id = ulid();

    await dataSource.transaction(async (manager) => {
      const repoMylist = manager.getRepository(Mylist);
      const repoGroup = manager.getRepository(MylistGroup);
      const repoInclusion = manager.getRepository(MylistGroupMylistInclusion);

      if (await repoInclusion.findOneBy({ mylist: { id: mylistId }, group: { id: groupId } }))
        throw new GraphQLError(`"${mylistGqlId}" is already included in "${groupGqlId}"`);

      const mylist = await repoMylist.findOneByOrFail({ id: mylistId }).catch(() => {
        throw new GraphQLNotExistsInDBError("Mylist", mylistId);
      });
      const group = await repoGroup.findOneByOrFail({ id: groupId }).catch(() => {
        throw new GraphQLNotExistsInDBError("MylistGroup", groupId);
      });
      inclusion.mylist = mylist;
      inclusion.group = group;

      repoInclusion.insert(inclusion);
    });

    return {
      inclusion: new MylistGroupMylistInclusionModel(inclusion),
    };
  }) satisfies MutationResolvers["addMylistToMylistGroup"];
