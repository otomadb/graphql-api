import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO, TagNameDTO } from "./dto.js";

export const resolverTagSearchItemByName = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    tag: ({ tagId }, _args, { currentUser: ctxUser }, info) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagDTO(v))
        .catch(() => {
          logger.error({ path: info.path, userId: ctxUser?.id }, "Not found");
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
    name: ({ nameId }, _args, { currentUser: ctxUser }, info) =>
      prisma.tagName
        .findUniqueOrThrow({ where: { id: nameId } })
        .then((v) => new TagNameDTO(v))
        .catch(() => {
          logger.error({ path: info.path, userId: ctxUser?.id }, "Not found");
          throw new GraphQLNotExistsInDBError("TagName", nameId);
        }),
  } satisfies Resolvers["TagSearchItemByName"]);
