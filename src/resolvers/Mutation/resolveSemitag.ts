import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Semitag } from "../../db/entities/semitags.js";
import { Tag } from "../../db/entities/tags.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../utils/id.js";

export const resolveSemitag = ({ dataSource: ds }: { dataSource: DataSource }) =>
  (async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }) => {
    // TODO: auth

    const semitagRepo = ds.getRepository(Semitag);
    const tagRepo = ds.getRepository(Tag);

    const semitagId = parseGqlID("semitag", semitagGqlId);
    if (!semitagId) throw new GraphQLError(`"${semitagGqlId}" is invalid id for semitag`);

    const semitag = await semitagRepo.findOne({ where: { id: semitagId } });
    if (!semitag) throw new GraphQLError(`No semitag found for "${semitagGqlId}"`);
    if (semitag.resolved) throw new GraphQLError(`semitag "${semitagGqlId}" was already resolved`);

    if (!tagGqlId) {
      semitag.resolved = true;
      await semitagRepo.update({ id: semitagId }, semitag);
      return { semitag };
    } else {
      const tagId = parseGqlID("tag", tagGqlId);
      if (!tagId) throw new GraphQLError(`"${tagGqlId}" is invalid id for tag`);
      const tag = await tagRepo.findOne({ where: { id: tagId } });
      if (!tag) throw new GraphQLError(`No tag found for "${tagGqlId}"`);

      semitag.resolved = true;
      semitag.tag = tag;
      await semitagRepo.update({ id: semitagId }, semitag);
      return { semitag };
    }
  }) satisfies MutationResolvers["resovleSemitag"];
