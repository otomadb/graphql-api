import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeRegistrationRequestDTO } from "./dto.js";

export const resolverYoutubeRegistrationRequestRejecting = ({
  prisma,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => YoutubeRegistrationRequestDTO.fromPrisma(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userRepository.getById(checkedById),
  } satisfies Resolvers["YoutubeRegistrationRequestRejecting"]);
