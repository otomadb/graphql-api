import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { YoutubeRegistrationRequestModel } from "../YoutubeRegistrationRequest/model.js";

export const resolverYoutubeRegistrationRequestRejecting = ({
  prisma,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new YoutubeRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userRepository.getById(checkedById),
  } satisfies Resolvers["YoutubeRegistrationRequestRejecting"]);
