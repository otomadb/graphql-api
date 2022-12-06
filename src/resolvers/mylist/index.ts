import { GraphQLError } from "graphql";

import { dataSource } from "../../db/data-source.js";
import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist, MylistShareRange } from "../../db/entities/mylists.js";
import { MylistRegistrationModel, UserModel } from "../../graphql/models.js";
import { MylistShareRange as MylistGQLShareRange } from "../../graphql/resolvers.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";

export const resolveMylist: Resolvers["Mylist"] = {
  id: ({ id }) => addIDPrefix(ObjectType.Mylist, id),
  range: ({ range }) => {
    switch (range) {
      case MylistShareRange.PUBLIC:
        return MylistGQLShareRange.Public;
      case MylistShareRange.KNOW_LINK:
        return MylistGQLShareRange.KnowLink;
      case MylistShareRange.PRIVATE:
        return MylistGQLShareRange.Private;
      default:
        throw new Error("Unknown Mylist Range");
    }
  },
  holder: async ({ id: mylistId }) => {
    const mylist = await dataSource.getRepository(Mylist).findOne({
      where: { id: mylistId },
      relations: { holder: true },
    });
    if (!mylist) throw new GraphQLError(`holder for mylist ${mylistId} is not found`);
    return new UserModel(mylist.holder);
  },
  registrations: async ({ id: mylistId }) => {
    const regs = await dataSource.getRepository(MylistRegistration).find({
      where: { mylist: { id: mylistId } },
    });

    return {
      nodes: regs.map((r) => new MylistRegistrationModel(r)),
    };
  },
  includes: async ({ id: mylistId }, { videoId }) => {
    return dataSource
      .getRepository(MylistRegistration)
      .findOne({ where: { mylist: { id: mylistId }, video: { id: videoId } } })
      .then((r) => !!r);
  },
};
