import { Prisma } from "@prisma/client";

import { InputMaybe, SortOrder } from "../graphql.js";

export const parsePrismaOrder = (v: InputMaybe<SortOrder> | undefined): Prisma.SortOrder | undefined => {
  if (!v) return undefined;
  switch (v) {
    case SortOrder.Asc:
      return Prisma.SortOrder.asc;
    case SortOrder.Desc:
      return Prisma.SortOrder.desc;
  }
};
