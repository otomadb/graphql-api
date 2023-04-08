import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoRegistrationRequestModel } from "../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolverNicovideoRegistrationRequestRejecting = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => UserModel.fromAuth0({ auth0Management, logger }, checkedById),
  } satisfies Resolvers["NicovideoRegistrationRequestRejecting"]);
