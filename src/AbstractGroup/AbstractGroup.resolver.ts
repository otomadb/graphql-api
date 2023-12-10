import { MkResolver } from "../utils/MkResolver.js";

export const mkAbstractGroupResolver: MkResolver<"AbstractGroup", "prisma"> = ({ prisma }) => {
  return {
    keyword: ({ keyword }) => keyword,
    name: async ({ keyword }, { locale }) =>
      prisma.abstractGroupName
        .findUnique({ where: { groupKeyword_locale: { groupKeyword: keyword, locale } } })
        .then((d) => d?.name || keyword),
  };
};
