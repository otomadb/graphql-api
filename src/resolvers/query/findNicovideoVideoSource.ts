import { DataSource } from "typeorm";

import { NicovideoVideoSource } from "../../db/entities/nicovideo_source.js";
import { NicovideoVideoSourceModel } from "../../graphql/models.js";

export const findNicovideoVideoSource =
  ({ dataSource: ds }: { dataSource: DataSource }) =>
  async (_: unknown, { sourceId }: { sourceId: string }) => {
    const s = await ds.getRepository(NicovideoVideoSource).findOne({ where: { sourceId }, relations: { video: true } });
    if (!s) return null;
    return new NicovideoVideoSourceModel({ id: s.id, sourceId: s.sourceId, videoId: s.video.id });
  };
