import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const searchVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input }) => {
    const videoTitles = await dataSourcs
      .getRepository(VideoTitle)
      .createQueryBuilder("videoTitle")
      .where({ title: Like(`%${input.query}%`) })
      .leftJoinAndSelect("videoTitle.video", "videos")
      .distinctOn(["videoTitle.video.id"])
      .skip(input.skip)
      .limit(input.limit)
      .getMany();

    const videos = await dataSource.getRepository(Video).find({
      where: { id: In(videoTitles.map((t) => t.video.id)) },
    });

    return {
      items: videoTitles.map((t) => {
        const video = videos.find((v) => v.id === t.video.id);
        if (!video) throw new GraphQLError(`Data inconcistency is occuring for "video:${t.video.id}"`);
        return {
          matchedTitle: t.title,
          video: new VideoModel(video),
        };
      }),
    };
  }) satisfies QueryResolvers["searchVideos"];
