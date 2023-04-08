import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolverNicovideoRegistrationRequest = ({
  prisma,
  auth0Management,
  logger,
  cache,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger" | "cache">) =>
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
    requestedBy: async ({ requestedById }) => UserModel.fromAuth0({ auth0Management, logger, cache }, requestedById),
  } satisfies Resolvers["NicovideoRegistrationRequest"]);
