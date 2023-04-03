import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { TagNameModel } from "../TagName/model.js";
import { ResolverDeps } from "../types.js";

export const resolverTagSearchItemByName = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    tag: ({ tagId }, _args, { currentUser: ctxUser }, info) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          logger.error({ path: info.path, userId: ctxUser?.id }, "Not found");
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
    name: ({ nameId }, _args, { currentUser: ctxUser }, info) =>
      prisma.tagName
        .findUniqueOrThrow({ where: { id: nameId } })
        .then((v) => new TagNameModel(v))
        .catch(() => {
          logger.error({ path: info.path, userId: ctxUser?.id }, "Not found");
          throw new GraphQLNotExistsInDBError("TagName", nameId);
        }),
  } satisfies Resolvers["TagSearchItemByName"]);
