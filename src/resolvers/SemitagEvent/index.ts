import { SemitagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel } from "../Semitag/model.js";
import { SemitagRejectingModel } from "../SemitagRejecting/model.js";
import { SemitagResolvingModel } from "../SemitagResolving/model.js";
import { ResolverDeps } from "../types.js";

export const resolveSemitagEventCommonProps = ({ userRepository }: Pick<ResolverDeps, "userRepository">) =>
  ({
    id: ({ id }): string => buildGqlId("SemitagEvent", id),
    user: async ({ userId }) => userRepository.getById(userId),
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

export const resolveSemitagEventAttachEvent = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "prisma" | "userRepository" | "logger">) =>
  ({
    ...resolveSemitagEventCommonProps({ userRepository }),
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((v) => SemitagModel.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  } satisfies Resolvers["SemitagAttachEvent"]);

export const resolveSemitagEventResolveEvent = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger" | "userRepository">) =>
  ({
    ...resolveSemitagEventCommonProps({ userRepository }),
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
      return SemitagResolvingModel.make({ semitagId, videoTagId, note });
    },
  } satisfies Resolvers["SemitagResolveEvent"]);

export const resolveSemitagEventRejectEvent = ({
  prisma,
  logger,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "logger" | "userRepository">) =>
  ({
    ...resolveSemitagEventCommonProps({ userRepository }),
    rejecting: async ({ semitagId }, _args, _context, info) => {
      const checking = await prisma.semitagChecking.findUniqueOrThrow({ where: { semitagId } });
      if (checking.videoTagId) {
        logger.error({ path: info.path, parent: { semitagId } }, "SemitagChecking videoTagId must be null but not");
        throw new GraphQLError("Data inconsistency");
      }

      const { note } = checking;
      return SemitagRejectingModel.make({ semitagId, note });
    },
  } satisfies Resolvers["SemitagRejectEvent"]);
