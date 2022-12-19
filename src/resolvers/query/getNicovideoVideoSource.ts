import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { NicovideoVideoSource } from "../../db/entities/nicovideo_source.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";

export const getNicovideoVideoSource =
  ({ dataSource: ds }: { dataSource: DataSource }) =>
  async (_: unknown, { sourceId }: { sourceId: string }) => {
    const s = await ds.getRepository(NicovideoVideoSource).findOne({ where: { sourceId }, relations: { video: true } });
    if (!s) throw new GraphQLError(`NicovideoVideoSource cannot find with source id "${sourceId}"`);
    return new NicovideoVideoSourceModel({ id: s.id, sourceId: s.sourceId, videoId: s.video.id });
  };
