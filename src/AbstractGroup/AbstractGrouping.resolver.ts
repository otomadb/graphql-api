import { TagDTO } from "../Tag/dto.js";
import { MkResolver } from "../utils/MkResolver.js";
import { AbstractGroupDTO } from "./AbstractGroup.dto.js";

export const mkAbstractGroupingResolver: MkResolver<"AbstractGrouping", "prisma"> = ({ prisma }) => {
  return {
    id: ({ id }) => id,
    group: ({ groupKeyword }) =>
      prisma.abstractGroup
        .findUniqueOrThrow({ where: { keyword: groupKeyword } })
        .then((d) => AbstractGroupDTO.fromPrisma(d)),
    tag: ({ tagId }) => prisma.tag.findUniqueOrThrow({ where: { id: tagId } }).then((d) => TagDTO.fromPrisma(d)),
  };
};
