import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "../Tag/dto.js";

export const resolverYoutubeRegistrationRequest = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ dbId: requestId }) => buildGqlId("YoutubeRegistrationRequest", requestId),

    originalUrl: ({ sourceId }) => `https://www.youtube.com/watch?v=${sourceId}`,
    embedUrl: ({ sourceId }) => `https://www.youtube.com/embed/${sourceId}`,

    taggings: ({ dbId: requestId }) => {
      return prisma.youtubeRegistrationRequestTagging
        .findMany({ where: { requestId }, include: { tag: true } })
        .then((r) =>
          r.map(({ id, tag, note }) => ({
            id: buildGqlId("YoutubeRegistrationRequestTagging", id),
            tag: new TagDTO(tag),
            note,
          })),
        );
    },
    semitaggings: ({ dbId: requestId }) => {
      return prisma.youtubeRegistrationRequestSemitagging.findMany({ where: { requestId } }).then((r) =>
        r.map(({ id, name, note }) => ({
          id: buildGqlId("YoutubeRegistrationRequestSemitagging", id),
          name,
          note,
        })),
      );
    },
    requestedBy: async ({ requestedById }) => userService.getById(requestedById),
  }) satisfies Resolvers["YoutubeRegistrationRequest"];
