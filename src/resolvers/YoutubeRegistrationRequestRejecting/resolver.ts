import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { YoutubeRegistrationRequestModel } from "../YoutubeRegistrationRequest/model.js";

export const resolverYoutubeRegistrationRequestRejecting = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => YoutubeRegistrationRequestModel.fromPrisma(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
  } satisfies Resolvers["YoutubeRegistrationRequestRejecting"]);
