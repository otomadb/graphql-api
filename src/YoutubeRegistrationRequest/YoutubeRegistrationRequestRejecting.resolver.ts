import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeRegistrationRequestDTO } from "./YoutubeRegistrationRequest.dto.js";

export const resolverYoutubeRegistrationRequestRejecting = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => YoutubeRegistrationRequestDTO.fromPrisma(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
  }) satisfies Resolvers["YoutubeRegistrationRequestRejecting"];
