import { SemitagEventType } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import { AddSemitagToVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { SemitagModel } from "../../Semitag/model.js";
import { ResolverDeps } from "../../types.js";

export const addSemitagToVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { videoId: videoGqlId, name: semitagName } }, { user }) => {
    if (!user)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.InvalidVideoId,
      };

    if (!(await prisma.video.findUnique({ where: { id: videoId.data } })))
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.VideoNotFound,
      };

    const tagging = await prisma.semitag.findFirst({
      where: { videoId: videoId.data, name: semitagName },
    });
    if (tagging && !tagging.isChecked)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.AlreadyAttached,
      };
    else if (tagging && tagging.isChecked)
      return {
        __typename: "AddSemitagToVideoFailedPayload",
        message: AddSemitagToVideoFailedMessage.AlreadyChecked,
      };

    const semitag = await prisma.semitag.create({
      data: {
        name: semitagName,
        videoId: videoId.data,
        isChecked: false,
        events: {
          create: {
            userId: user.id,
            type: SemitagEventType.ATTACH,
            payload: {},
          },
        },
      },
    });

    return {
      __typename: "AddSemitagToVideoSucceededPayload",
      semitag: SemitagModel.fromPrisma(semitag),
    };
  }) satisfies MutationResolvers["addSemitagToVideo"];
