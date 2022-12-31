import { GraphQLError } from "graphql";
import { DataSource, In } from "typeorm";

import { Mylist, MylistShareRange } from "../../db/entities/mylists.js";
import { MylistShareRange as GraphQLMylistShareRange, Resolvers, UserResolvers } from "../../graphql.js";
import { addIDPrefix, buildGqlId, ObjectType } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";

export const convertMylistShareRange = (ranges: GraphQLMylistShareRange[]) =>
  ranges.map((r) => {
    switch (r) {
      case GraphQLMylistShareRange.Public:
        return MylistShareRange.PUBLIC;
      case GraphQLMylistShareRange.KnowLink:
        return MylistShareRange.KNOW_LINK;
      case GraphQLMylistShareRange.Private:
        return MylistShareRange.PRIVATE;
    }
  });

export const resolveId = (({ id }) => addIDPrefix(ObjectType.User, id)) satisfies UserResolvers["id"];

export const resolveUser = ({ dataSource: ds }: { dataSource: DataSource }) =>
  ({
    id: resolveId,
    favorites: async ({ id: userId }) => {
      const mylist = await ds.getRepository(Mylist).findOne({
        where: { holder: { id: userId }, isLikeList: true },
      });

      if (!mylist) throw new GraphQLError(`User "${userId}" favorites not found`);
      return new MylistModel(mylist);
    },
    mylists: async ({ id: userId }, { input }, { user: authuser }) => {
      if (input.range.includes(GraphQLMylistShareRange.Private) && userId !== authuser?.id)
        throw new GraphQLError(
          `Cannot list "${GraphQLMylistShareRange.Private}" mylists for "${buildGqlId("user", userId)}"`
        );
      if (input.range.includes(GraphQLMylistShareRange.KnowLink) && userId !== authuser?.id)
        throw new GraphQLError(
          `Cannot list "${GraphQLMylistShareRange.KnowLink}" mylists for "${buildGqlId("user", userId)}"`
        );

      const nodes = await ds
        .getRepository(Mylist)
        .find({
          where: {
            holder: { id: userId },
            range: In(convertMylistShareRange(input.range)),
          },
          take: input.limit,
          skip: input.skip,
          order: {
            createdAt: input.order.createdAt || undefined,
            updatedAt: input.order.updatedAt || undefined,
          },
        })
        .then((ms) => ms.map((m) => new MylistModel(m)));

      return {
        nodes,
      };
    },
  } satisfies Resolvers["User"]);
