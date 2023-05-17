import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoRegistrationRequestModel } from "../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../types.js";

export const resolverNicovideoRegistrationRequestRejecting = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
  } satisfies Resolvers["NicovideoRegistrationRequestRejecting"]);
