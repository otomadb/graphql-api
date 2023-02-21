import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID, parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";

export const queryNicovideoRegistrationRequest = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { id }) =>
    prisma.nicovideoRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoRegistrationRequest", id) } })
      .then((v) => new NicovideoRegistrationRequestModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", id);
      })) satisfies QueryResolvers["NicovideoRegistrationRequest"];
