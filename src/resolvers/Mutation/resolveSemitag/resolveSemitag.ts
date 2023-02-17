import { SemitagEventType, UserRole, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { ok, Result } from "../../../utils/Result.js";
import { MutationResolvers, ResolveSemitagFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagResolvingModel } from "../../Semitag/model.js";
import { resolve as resolveSemitagInNeo4j } from "./neo4j.js";

export const resolve = async (
  prisma: ResolverDeps["prisma"],
  { userId, semitagId, tagId }: { userId: string; semitagId: string; tagId: string }
): Promise<
  Result<
    "SEMITAG_NOT_FOUND" | "SEMITAG_ALREADY_CHECKED" | "TAG_NOT_FOUND" | "VIDEO_ALREADY_TAGGED",
    { videoTagId: string; note: null; semitagId: string }
  >
> => {
  const checkedSemitag = await prisma.semitag.findUnique({ where: { id: semitagId } });
  if (!checkedSemitag) return { status: "error", error: "SEMITAG_NOT_FOUND" };
  if (checkedSemitag.isChecked) return { status: "error", error: "SEMITAG_ALREADY_CHECKED" };

  const checkedTag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!checkedTag) return { status: "error", error: "TAG_NOT_FOUND" };

  if (
    await prisma.videoTag.findUnique({
      where: { videoId_tagId: { tagId: checkedTag.id, videoId: checkedSemitag.videoId } },
    })
  )
    return { status: "error", error: "VIDEO_ALREADY_TAGGED" };

  const videoTagId = ulid();
  await prisma.semitag.update({
    where: { id: checkedSemitag.id },
    data: {
      isChecked: true,
      events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
      checking: {
        create: {
          videoTag: {
            create: {
              id: videoTagId,
              tag: { connect: { id: tagId } },
              video: { connect: { id: checkedSemitag.videoId } },
              events: { create: { userId, type: VideoTagEventType.ATTACH, payload: {} } },
            },
          },
        },
      },
    },
  });

  return ok({ videoTagId, note: null, semitagId: checkedSemitag.id });
};

export const resolveSemitag = ({ prisma, logger, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }, { user }, info) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "ResolveSemitagFailedPayload",
        message: ResolveSemitagFailedMessage.Forbidden,
      };

    const semitagId = parseGqlID2("Semitag", semitagGqlId);
    if (semitagId.status === "error")
      return {
        __typename: "ResolveSemitagFailedPayload",
        message: ResolveSemitagFailedMessage.InvalidSemitagId,
      };

    const tagId = parseGqlID2("Semitag", tagGqlId);
    if (tagId.status === "error")
      return {
        __typename: "ResolveSemitagFailedPayload",
        message: ResolveSemitagFailedMessage.InvalidTagId,
      };

    const result = await resolve(prisma, {
      userId: user.id,
      semitagId: semitagId.data,
      tagId: tagId.data,
    });
    if (result.status === "error") {
      switch (result.error) {
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "ResolveSemitagFailedPayload",
            message: ResolveSemitagFailedMessage.SemitagNotFound,
          };
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "ResolveSemitagFailedPayload",
            message: ResolveSemitagFailedMessage.SemitagAlreadyChecked,
          };
        case "TAG_NOT_FOUND":
          return {
            __typename: "ResolveSemitagFailedPayload",
            message: ResolveSemitagFailedMessage.TagNotFound,
          };
        case "VIDEO_ALREADY_TAGGED":
          return {
            __typename: "ResolveSemitagFailedPayload",
            message: ResolveSemitagFailedMessage.VideoAlreadyTagged,
          };
        default:
          return {
            __typename: "ResolveSemitagFailedPayload",
            message: ResolveSemitagFailedMessage.Unknown,
          };
      }
    }

    const data = result.data;

    const neo4jResult = await resolveSemitagInNeo4j({ prisma, neo4j }, data.videoTagId);
    if (neo4jResult.status === "error") {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "ResolveSemitagSucceededPayload",
      resolving: new SemitagResolvingModel(data),
    };
  }) satisfies MutationResolvers["resovleSemitag"];
