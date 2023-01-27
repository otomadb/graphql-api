import { PseudoTagType, TagResolvers } from "../../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolvePseudoType = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: tagId }) => {
    const parents = await prisma.tagParent.findMany({
      where: { childId: tagId, parent: { meaningless: true } },
      include: { parent: { include: { names: true } } },
    });
    const parentNames = parents.reduce(
      (p, { parent }) => [...p, ...parent.names.map(({ name }) => name)],
      [] as string[]
    );

    const est: PseudoTagType[] = [];
    if (parentNames.includes("COPYRIGHT")) est.push(PseudoTagType.Copyright);
    if (parentNames.includes("CHARACTER")) est.push(PseudoTagType.Character);
    if (parentNames.includes("SERIES")) est.push(PseudoTagType.Series);
    if (parentNames.includes("MUSIC")) est.push(PseudoTagType.Music);
    if (parentNames.includes("TACTICS")) est.push(PseudoTagType.Tactics);
    if (parentNames.includes("EVENT")) est.push(PseudoTagType.Event);
    if (parentNames.includes("PHRASE")) est.push(PseudoTagType.Phrase);
    if (parentNames.includes("STYLE")) est.push(PseudoTagType.Style);

    if (est.length === 0) return PseudoTagType.Unknown;
    else if (1 < est.length) return PseudoTagType.Subtle;
    else return est[0];
  }) satisfies TagResolvers["pseudoType"];
