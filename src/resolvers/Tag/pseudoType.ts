import { DataSource } from "typeorm";

import { TagParent } from "../../db/entities/tag_parents.js";
import { PseudoTagType, TagResolvers } from "../../graphql.js";

export const calcType = (names: string[]): PseudoTagType => {
  const type: PseudoTagType[] = [];
  if (names.includes("COPYRIGHT")) type.push(PseudoTagType.Copyright);
  if (names.includes("CHARACTER")) type.push(PseudoTagType.Character);
  if (names.includes("SERIES")) type.push(PseudoTagType.Series);
  if (names.includes("MUSIC")) type.push(PseudoTagType.Music);
  if (names.includes("TACTICS")) type.push(PseudoTagType.Tactics);
  if (names.includes("EVENT")) type.push(PseudoTagType.Event);
  if (names.includes("PHRASE")) type.push(PseudoTagType.Phrase);
  if (names.includes("STYLE")) type.push(PseudoTagType.Style);

  if (type.length === 1) return type[0];
  else if (type.length === 0) return PseudoTagType.Unknown;
  else return PseudoTagType.Subtle;
};

export const resolvePseudoType = ({ dataSource }: { dataSource: DataSource }) =>
  (async ({ id: tagId }) =>
    dataSource
      .getRepository(TagParent)
      .find({ where: { child: { id: tagId } }, relations: ["parent.tagNames"] })
      .then((ps) =>
        ps
          .filter((p) => p.parent.meaningless) // TODO: なぜか`{where:{child:{meaningless:true}}}`で動かなかったので
          .reduce((p, { parent }) => [...p, ...parent.tagNames.map(({ name }) => name)], [] as string[])
      )
      .then((names) => calcType(names))) satisfies TagResolvers["pseudoType"];
