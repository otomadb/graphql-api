import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { NicovideoVideoSource } from "../../../db/entities/nicovideo_video_sources.js";
import { QueryResolvers } from "../../../graphql.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";

export const nicovideoVideoSource = ({ dataSource: ds }: { dataSource: DataSource }) =>
  (async (_, { id }) => {
    const s = await ds.getRepository(NicovideoVideoSource).findOne({ where: { id }, relations: { video: true } });
    if (!s) throw new GraphQLError(`NicovideoVideoSource cannot find with id "${id}"`);
    return new NicovideoVideoSourceModel({ id: s.id, sourceId: s.sourceId, videoId: s.video.id });
  }) satisfies QueryResolvers["nicovideoVideoSource"];
