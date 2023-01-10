import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Semitag } from "../../../db/entities/semitags.js";
import { QueryResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { SemitagModel } from "../../Semitag/model.js";

export const semitag = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id: gqlId }) => {
    const id = parseGqlID("Semitag", gqlId);

    const semitag = await dataSource.getRepository(Semitag).findOne({ where: { id } });
    if (!semitag) throw new GraphQLError(`No semitag found for "${gqlId}"`);
    return new SemitagModel(semitag);
  }) satisfies QueryResolvers["semitag"];
