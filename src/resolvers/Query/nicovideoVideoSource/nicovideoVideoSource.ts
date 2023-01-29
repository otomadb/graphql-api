import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";

export const nicovideoVideoSource = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.nicovideoVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoVideoSource", id) } })
      .then((v) => new NicovideoVideoSourceModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("NicovideoVideoSource", id);
      })) satisfies QueryResolvers["nicovideoVideoSource"];
