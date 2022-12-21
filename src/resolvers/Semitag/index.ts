import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Semitag } from "../../db/entities/semitags.js";
import { Resolvers } from "../../graphql.js";
import { buildGqlId } from "../../utils/id.js";

export const resolveSemitag = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }): string => buildGqlId("semitag", id),
    async video({ id }) {
      const semitag = await dataSource.getRepository(Semitag).findOne({
        where: { id },
        relations: { video: true },
      });
      if (!semitag) throw new GraphQLError(`"video" for "semitag:${id}" is not found`);
      return semitag.video;
    },
  } satisfies Resolvers["Semitag"]);
