import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";

export const findNicovideoVideoSource = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input: { sourceId } }) => {
    if (!sourceId) throw new GraphQLError("source id must be provided"); // TODO: error messsage

    const source = await prisma.nicovideoVideoSource.findFirst({ where: { sourceId } });
    if (!source) return null;

    return new NicovideoVideoSourceModel(source);
  }) satisfies QueryResolvers["findNicovideoVideoSource"];
