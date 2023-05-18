import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const resolverNicovideoRegistrationRequestRejecting = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestDTO(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
  } satisfies Resolvers["NicovideoRegistrationRequestRejecting"]);
