import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";

export const resolverYoutubeRegistrationRequest = ({
  prisma,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
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
            tag: new TagModel(tag),
            note,
          }))
        );
    },
    semitaggings: ({ dbId: requestId }) => {
      return prisma.youtubeRegistrationRequestSemitagging.findMany({ where: { requestId } }).then((r) =>
        r.map(({ id, name, note }) => ({
          id: buildGqlId("YoutubeRegistrationRequestSemitagging", id),
          name,
          note,
        }))
      );
    },
    requestedBy: async ({ requestedById }) => userRepository.getById(requestedById),
  } satisfies Resolvers["YoutubeRegistrationRequest"]);
