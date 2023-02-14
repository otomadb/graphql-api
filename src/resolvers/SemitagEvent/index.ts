import { SemitagEventType } from "@prisma/client";
import { z } from "zod";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { SemitagModel } from "../Semitag/model.js";
import { UserModel } from "../User/model.js";

export const resolveSemitagEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("SemitagEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((v) => new SemitagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  } satisfies Omit<Exclude<Resolvers["SemitagEvent"], undefined>, "__resolveType">);

export const resolveSemitagEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case SemitagEventType.ATTACH:
          return "SemitagAttachEvent";
        case SemitagEventType.RESOLVE:
          return "SemitagResolveEvent";
        case SemitagEventType.REJECT:
          return "SemitagRejectEvent";
      }
    },
  } satisfies Resolvers["SemitagEvent"]);

export const resolveSemitagEventAttachEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps(deps),
  } satisfies Resolvers["SemitagAttachEvent"]);

const schemaSemitagEventResolveEventPayload = z.object({ resolveTo: z.string() });
export type SemitagEventResolveEventPayload = z.infer<typeof schemaSemitagEventResolveEventPayload>;
export const resolveSemitagEventResolveEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps({ prisma }),
  } satisfies Resolvers["SemitagResolveEvent"]);

export const resolveSemitagEventRejectEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps(deps),
  } satisfies Resolvers["SemitagRejectEvent"]);
