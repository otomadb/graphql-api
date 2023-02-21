import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";
import { UserModel } from "../User/model.js";

export const resolverNicovideoRegistrationRequest = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    taggings: ({ dbId: requestId }) => {
      return prisma.nicovideoRegistrationRequestTagging
        .findMany({ where: { requestId }, select: { tag: true, note: true } })
        .then((r) => r.map(({ tag, note }) => ({ tag: new TagModel(tag), note })));
    },
    semitaggings: ({ dbId: requestId }) => {
      return prisma.nicovideoRegistrationRequestSemitagging
        .findMany({ where: { requestId }, select: { name: true, note: true } })
        .then((r) => r.map(({ name, note }) => ({ name, note })));
    },

    requestedBy: ({ requestedById }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: requestedById } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", requestedById);
        }),
  } satisfies Resolvers["NicovideoRegistrationRequest"]);
