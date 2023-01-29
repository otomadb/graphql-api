import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";
import { TagModel } from "../Tag/model.js";

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
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
  } satisfies Resolvers["MylistTagInclusion"]);
