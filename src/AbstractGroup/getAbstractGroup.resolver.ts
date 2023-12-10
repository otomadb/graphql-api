import { GraphQLError } from "graphql";

import { MkQueryResolver } from "../utils/MkResolver.js";
import { AbstractGroupDTO } from "./AbstractGroup.dto.js";

export const mkGetAbstractGroupResolver: MkQueryResolver<"getAbstractGroup", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  (_parent, { keyword }) =>
    prisma.abstractGroup
      .findUniqueOrThrow({ where: { keyword } })
      .then((d) => AbstractGroupDTO.fromPrisma(d))
      .catch((e) => {
        logger.error(e);
        throw new GraphQLError("Failed to get AbstractGroup");
      });
