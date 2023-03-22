import { SemitagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel, SemitagRejectingModel, SemitagResolvingModel } from "../Semitag/model.js";
import { ResolverDeps } from "../types.js";
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

export const resolveSemitagEventAttachEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveSemitagEventCommonProps({ prisma }),
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((v) => new SemitagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  } satisfies Resolvers["SemitagAttachEvent"]);

export const resolveSemitagEventResolveEvent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    ...resolveSemitagEventCommonProps({ prisma }),
    resolving: async ({ semitagId }, _args, _context, info) => {
      const checking = await prisma.semitagChecking.findUniqueOrThrow({ where: { semitagId } });
      if (!checking.videoTagId) {
        logger.error(
          { path: info.path, parent: { semitagId } },
          "SemitagChecking videoTagId must not be null but null"
        );
        throw new GraphQLError("Data inconsistency");
      }

      const { videoTagId, note } = checking;
      return new SemitagResolvingModel({ semitagId, videoTagId, note });
    },
  } satisfies Resolvers["SemitagResolveEvent"]);

export const resolveSemitagEventRejectEvent = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    ...resolveSemitagEventCommonProps({ prisma }),
    rejecting: async ({ semitagId }, _args, _context, info) => {
      const checking = await prisma.semitagChecking.findUniqueOrThrow({ where: { semitagId } });
      if (checking.videoTagId) {
        logger.error({ path: info.path, parent: { semitagId } }, "SemitagChecking videoTagId must be null but not");
        throw new GraphQLError("Data inconsistency");
      }

      const { note } = checking;
      return new SemitagRejectingModel({ semitagId, note });
    },
  } satisfies Resolvers["SemitagRejectEvent"]);
