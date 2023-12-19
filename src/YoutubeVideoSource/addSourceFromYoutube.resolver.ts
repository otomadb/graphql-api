import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MkMutationResolver2 } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

export const mkAddSourceFromYoutubeResolver: MkMutationResolver2<"addSourceFromYoutube", "prisma"> =
  (logger, { prisma }) =>
  async (
    _,
    {
      input: {
        madId: gqlMadId,
        title: { title, locale: titleLocale },
        sourceId,
        isOriginal,
      },
    },
  ) => {
    const madId = parseGqlID3("Video", gqlMadId);
    if (isErr(madId)) {
      logger.error({ madId: gqlMadId, error: madId.error }, "Invalid form madId");
      throw new GraphQLError("Invalid form madId");
    }

    const [source] = await prisma.$transaction([
      prisma.youtubeVideoSource.create({
        data: {
          sourceId,
          isOriginal,
          videoId: madId.data,
        },
        include: {
          video: true,
        },
      }),
      prisma.videoTitle.create({
        data: {
          videoId: madId.data,
          isPrimary: false,
          title,
          locale: titleLocale,
        },
      }),
    ]);
    const video = source.video;

    return {
      source: YoutubeVideoSourceDTO.fromPrisma(source),
      video: VideoDTO.fromPrisma(video),
    };
  };
