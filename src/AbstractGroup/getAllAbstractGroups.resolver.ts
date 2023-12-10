import { GraphQLError } from "graphql";

import { MkQueryResolver } from "../utils/MkResolver.js";
import { AbstractGroupDTO } from "./AbstractGroup.dto.js";

export const mkGetAbstractGroupsResolver: MkQueryResolver<"getAllAbstractGroups", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  () =>
    prisma.abstractGroup
      .findMany()
      .then((gs) => gs.map((g) => AbstractGroupDTO.fromPrisma(g)))
      .catch((e) => {
        logger.error(e);
        throw new GraphQLError("Failed to get all abstractGroups");
      });
