import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../db/entities/semitags.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../utils/id.js";

export const addSemitagToVideo = ({ dataSource: ds }: { dataSource: DataSource }) =>
  (async (_parent, { input: { videoId: videoGqlId, name: semitagName } }) => {
    // TODO: auth

    const videoId = parseGqlID("video", videoGqlId);
    if (!videoId) throw new GraphQLError(`"${videoGqlId}" is invalid id for video`);

    const video = await ds.getRepository(Video).findOne({ where: { id: videoId } });
    if (!video) throw new GraphQLError(`No video found for "${videoGqlId}"`);

    if (
      await ds
        .getRepository(Semitag)
        .findOne({ where: { video: { id: video.id }, name: semitagName, resolved: false } })
    )
      throw new GraphQLError(`"${semitagName}" is already registered for "${videoGqlId}"`);

    const semitag = new Semitag();
    semitag.id = ulid();
    semitag.name = semitagName;
    semitag.video = video;

    await ds.getRepository(Semitag).insert(semitag);

    return { video, semitag };
  }) satisfies MutationResolvers["addSemitagToVideo"];
