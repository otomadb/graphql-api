import { DataSource, In, Not } from "typeorm";

import { Semitag } from "../../db/entities/semitags.js";
import { QueryResolvers } from "../../graphql.js";
import { parseGqlIDs } from "../../utils/id.js";
import { SemitagModel } from "../Semitag/model.js";

export const findSemitags = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input }) => {
    const execptIds = parseGqlIDs("semitag", input.except);

    const semitags = await dataSource.getRepository(Semitag).find({
      take: input.limit,
      skip: input.skip,
      order: {
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
      },
      where: { id: Not(In(execptIds)) },
    });
    return { nodes: semitags.map((t) => new SemitagModel(t)) };
  }) satisfies QueryResolvers["findSemitags"];
