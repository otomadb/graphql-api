import { SemitagEventType } from "@prisma/client";

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
          return "SemitagEventAttachEvent";
        case SemitagEventType.RESOLVE:
          return "SemitagEventResolveEvent";
        case SemitagEventType.REJECT:
          return "SemitagEventRejectEvent";
      }
    },
  } satisfies Resolvers["SemitagEvent"]);

export const resolveSemitagEventAttachEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps(deps),
  } satisfies Resolvers["SemitagEventAttachEvent"]);

export const resolveSemitagEventResolveEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps(deps),
  } satisfies Resolvers["SemitagEventResolveEvent"]);

export const resolveSemitagEventRejectEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps(deps),
  } satisfies Resolvers["SemitagEventRejectEvent"]);
