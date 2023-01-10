import { DataSource } from "typeorm";

import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { VideoModel } from "../Video/model.js";

export const resolveVideoSimilarity = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    origin: ({ originId }) =>
      dataSource
        .getRepository(Video)
        .findOneByOrFail({ id: originId })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", originId);
        }),
    to: ({ toId }) =>
      dataSource
        .getRepository(Video)
        .findOneByOrFail({ id: toId })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", toId);
        }),
  } satisfies Resolvers["VideoSimilarity"]);
