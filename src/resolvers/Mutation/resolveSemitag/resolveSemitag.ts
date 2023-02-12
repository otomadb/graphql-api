import { Semitag, SemitagEventType, UserRole, VideoTag, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { Result } from "../../../utils/Result.js";
import { MutationResolvers, ResolveSemitagFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const resolveSemitagInNeo4j = async (
  neo4jDriver: ResolverDeps["neo4j"],
  { videoId, tagId }: { videoId: string; tagId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MERGE (v:Video {id: $video_id})
      MERGE (t:Tag {id: $tag_id})
      MERGE r=(v)-[:TAGGED_BY]->(t)
      RETURN r
      `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const resolve = async (
  prisma: ResolverDeps["prisma"],
  { userId, semitagId, tagId }: { userId: string; semitagId: string; tagId: string }
): Promise<
  Result<
    "SEMITAG_NOT_FOUND" | "SEMITAG_ALREADY_CHECKED" | "TAG_NOT_FOUND" | "VIDEO_ALREADY_TAGGED",
    { semitag: Semitag; videotag: VideoTag }
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

  const [semitag, videotag] = await prisma.$transaction([
    prisma.semitag.update({
      where: { id: semitagId },
      data: {
        isChecked: true,
        videoTagId,
        events: {
          create: {
            userId,
            type: SemitagEventType.RESOLVE,
            payload: {},
          },
        },
      },
    }),
    prisma.videoTag.create({
      data: {
        id: videoTagId,
        videoId: checkedSemitag.videoId,
        tagId: checkedTag.id,
        events: {
          create: {
            userId,
            type: VideoTagEventType.ATTACH,
            payload: {},
          },
        },
      },
    }),
  ]);
  return {
    status: "ok",
    data: { semitag, videotag },
  };
};

export const resolveSemitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }, { user }) => {
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

    const { semitag } = result.data;
    return {
      __typename: "ResolveSemitagSucceededPayload",
      semitag: new SemitagModel(semitag),
    };
  }) satisfies MutationResolvers["resovleSemitag"];
