import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistGroup, MylistGroupMylistInclusion } from "../../../db/entities/mylist_group.js";
import { Mylist } from "../../../db/entities/mylists.js";
import { MutationResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { MylistGroupMylistInclusionModel } from "../../MylistGroupMylistInclusion/model.js";

export const addMylistToMylistGroup = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input: { mylistId: mylistGqlId, groupId: groupGqlId } }) => {
    const mylistId = parseGqlID("mylist", mylistGqlId);
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
        throw new GraphQLNotExistsInDBError("mylist", mylistId);
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
