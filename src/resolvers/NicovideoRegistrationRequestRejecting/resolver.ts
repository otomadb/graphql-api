import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoRegistrationRequestModel } from "../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolverNicovideoRegistrationRequestRejecting = ({
  prisma,
  auth0Management,
}: Pick<ResolverDeps, "prisma" | "auth0Management">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    rejectedBy: async ({ checkedById }) => UserModel.fromAuth0User(await auth0Management.getUser({ id: checkedById })),
  } satisfies Resolvers["NicovideoRegistrationRequestRejecting"]);
