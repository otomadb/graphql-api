import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { TagModel } from "../resolvers/Tag/model.js";
import { ResolverDeps } from "../resolvers/types.js";

export const resolverNicovideoRegistrationRequest = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ dbId: requestId }) => buildGqlId("NicovideoRegistrationRequest", requestId),

    originalUrl: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    embedUrl: ({ sourceId }) => `https://embed.nicovideo.jp/watch/${sourceId}`,

    taggings: ({ dbId: requestId }) => {
      return prisma.nicovideoRegistrationRequestTagging
        .findMany({ where: { requestId }, include: { tag: true } })
        .then((r) =>
          r.map(({ id, tag, note }) => ({
            id: buildGqlId("NicovideoRegistrationRequestTagging", id),
            tag: new TagModel(tag),
            note,
          }))
        );
    },
    semitaggings: ({ dbId: requestId }) => {
      return prisma.nicovideoRegistrationRequestSemitagging.findMany({ where: { requestId } }).then((r) =>
        r.map(({ id, name, note }) => ({
          id: buildGqlId("NicovideoRegistrationRequestSemitagging", id),
          name,
          note,
        }))
      );
    },
    requestedBy: async ({ requestedById }) => userService.getById(requestedById),
  } satisfies Resolvers["NicovideoRegistrationRequest"]);
