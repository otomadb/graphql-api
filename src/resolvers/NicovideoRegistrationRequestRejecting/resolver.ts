import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoRegistrationRequestModel } from "../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolverNicovideoRegistrationRequestRejecting = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    rejectedBy: ({ checkedById }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: checkedById } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", checkedById);
        }),
  } satisfies Resolvers["NicovideoRegistrationRequestRejecting"]);
