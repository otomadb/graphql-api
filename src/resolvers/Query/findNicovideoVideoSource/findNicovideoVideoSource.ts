import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { NicovideoVideoSource } from "../../../db/entities/nicovideo_video_sources.js";
import { QueryResolvers } from "../../../graphql.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";

export const findNicovideoVideoSource = ({ dataSource: ds }: { dataSource: DataSource }) =>
  (async (_, { input: { sourceId } }) => {
    if (!sourceId) throw new GraphQLError("source id must be provided"); // TODO: error messsage

    const s = await ds.getRepository(NicovideoVideoSource).findOne({ where: { sourceId }, relations: { video: true } });
    if (!s) return null;
    return new NicovideoVideoSourceModel({ id: s.id, sourceId: s.sourceId, videoId: s.video.id });
  }) satisfies QueryResolvers["findNicovideoVideoSource"];
