import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../db/entities/semitags.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../utils/id.js";
import { SemitagModel } from "../Semitag/model.js";

export const addSemitagToVideo = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input: { videoId: videoGqlId, name: semitagName } }) => {
    // TODO: auth

    const videoId = parseGqlID("video", videoGqlId);
    if (!videoId) throw new GraphQLError(`"${videoGqlId}" is invalid id for video`);

    const semitag = new Semitag();
    semitag.id = ulid();
    semitag.name = semitagName;

    await dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const repoSemitag = manager.getRepository(Semitag);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw new GraphQLError(`No video found for "${videoGqlId}"`);

      if (await repoSemitag.findOne({ where: { video: { id: video.id }, name: semitagName, resolved: false } }))
        throw new GraphQLError(`"${semitagName}" is already registered for "${videoGqlId}"`);

      semitag.video = video;
      await repoSemitag.insert(semitag);
    });

    return { semitag: new SemitagModel(semitag) };
  }) satisfies MutationResolvers["addSemitagToVideo"];
