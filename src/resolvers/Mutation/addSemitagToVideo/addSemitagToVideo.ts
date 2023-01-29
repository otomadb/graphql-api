import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";

import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const addSemitagToVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ensureContextUser(UserRole.NORMAL, async (_parent, { input: { videoId: videoGqlId, name: semitagName } }) => {
    const videoId = parseGqlID("Video", videoGqlId);

    if (!(await prisma.video.findUnique({ where: { id: videoId } })))
      throw new GraphQLNotExistsInDBError("Video", videoId);

    if (await prisma.semitag.findFirst({ where: { videoId, name: semitagName, isResolved: false } }))
      throw new GraphQLError(`"${semitagName}" is already registered for "${videoGqlId}"`);

    const semitag = await prisma.semitag.create({
      data: {
        name: semitagName,
        videoId,
        isResolved: false,
      },
    });

    return {
      semitag: new SemitagModel(semitag),
    };
  }) satisfies MutationResolvers["addSemitagToVideo"];
