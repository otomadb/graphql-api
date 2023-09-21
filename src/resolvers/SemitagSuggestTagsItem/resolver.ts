import { TagDTO, TagNameDTO } from "../../Tag/dto.js";
import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";

export const resolverSemitagSuggestTagsItem = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
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
    canResolveTo: ({ semitagId, tagId }) =>
      prisma.videoTag
        .findFirst({
          where: {
            video: { semitags: { some: { id: semitagId } } },
            tagId,
          },
        })
        .then((v) => !v),
  }) satisfies Resolvers["SemitagSuggestTagsItem"];
