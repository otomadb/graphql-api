import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";
import { MylistGroupModel } from "../MylistGroup/model.js";

export const resolveMylistGroupMylistInclusion = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroupMylistInclusion", id),
    mylist: async ({ mylistId }) =>
      prisma.mylist
        .findUniqueOrThrow({ where: { id: mylistId } })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", mylistId);
        }),
    group: async ({ groupId }) =>
      prisma.mylistGroup
        .findUniqueOrThrow({ where: { id: groupId } })
        .then((v) => new MylistGroupModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("MylistGroup", groupId);
        }),
  } satisfies Resolvers["MylistGroupMylistInclusion"]);
