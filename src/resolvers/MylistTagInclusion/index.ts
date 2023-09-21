import { TagDTO } from "../../Tag/dto.js";
import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { MylistModel } from "../Mylist/model.js";
import { ResolverDeps } from "../types.js";

export const resolveMylistTagInclusion = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    mylist: ({ mylistId }) =>
      prisma.mylist
        .findUniqueOrThrow({ where: { id: mylistId } })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", mylistId);
        }),
    tag: ({ tagId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
  }) satisfies Resolvers["MylistTagInclusion"];
