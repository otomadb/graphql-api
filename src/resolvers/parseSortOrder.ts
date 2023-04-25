import { Prisma } from "@prisma/client";

import { err, ok, Result } from "../utils/Result.js";
import { InputMaybe, SortOrder } from "./graphql.js";

export const parseSortOrder = (v: InputMaybe<SortOrder> | undefined): Prisma.SortOrder | undefined => {
  if (!v) return undefined;
  switch (v) {
    case SortOrder.Asc:
      return Prisma.SortOrder.asc;
    case SortOrder.Desc:
      return Prisma.SortOrder.desc;
  }
};

export const parseOrderBy = <T extends string>(orderBy: { [key in T]?: InputMaybe<SortOrder> }): Result<
  { message: "DUP" },
  { [key in T]: Prisma.SortOrder }
> => {
  const entities = Object.entries(orderBy);

  if (entities.length === 0) return ok({} as { [key in T]: Prisma.SortOrder });
  if (2 <= entities.length) return err({ message: "DUP" });

  const [key, val] = entities[0] as [T, SortOrder];
  switch (val) {
    case SortOrder.Asc:
      return ok({ [key]: Prisma.SortOrder.asc } as { [key in T]: Prisma.SortOrder });
    case SortOrder.Desc:
      return ok({ [key]: Prisma.SortOrder.desc } as { [key in T]: Prisma.SortOrder });
  }
};
