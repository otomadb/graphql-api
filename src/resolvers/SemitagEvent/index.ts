import { SemitagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel } from "../Semitag/model.js";
import { SemitagRejectingModel } from "../SemitagRejecting/model.js";
import { SemitagResolvingModel } from "../SemitagResolving/model.js";
import { ResolverDeps } from "../types.js";

export const resolveSemitagEventCommonProps = ({ userService }: Pick<ResolverDeps, "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("SemitagEvent", id),
    user: async ({ userId }) => userService.getById(userId),
  }) satisfies Omit<Exclude<Resolvers["SemitagEvent"], undefined>, "__resolveType">;

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
  }) satisfies Resolvers["SemitagEvent"];

export const resolveSemitagEventAttachEvent = ({
  prisma,
  userService,
  logger,
}: Pick<ResolverDeps, "prisma" | "userService" | "logger">) =>
  ({
    ...resolveSemitagEventCommonProps({ userService }),
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((v) => SemitagModel.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  }) satisfies Resolvers["SemitagAttachEvent"];

export const resolveSemitagEventResolveEvent = ({
  prisma,
  userService,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger" | "userService">) =>
  ({
    ...resolveSemitagEventCommonProps({ userService }),
    resolving: async ({ semitagId }, _args, _context, info) => {
      const checking = await prisma.semitagChecking.findUniqueOrThrow({ where: { semitagId } });
      if (!checking.videoTagId) {
        logger.error(
          { path: info.path, parent: { semitagId } },
          "SemitagChecking videoTagId must not be null but null",
        );
        throw new GraphQLError("Data inconsistency");
      }

      const { videoTagId, note } = checking;
      return SemitagResolvingModel.make({ semitagId, videoTagId, note });
    },
  }) satisfies Resolvers["SemitagResolveEvent"];

export const resolveSemitagEventRejectEvent = ({
  prisma,
  logger,
  userService,
}: Pick<ResolverDeps, "prisma" | "logger" | "userService">) =>
  ({
    ...resolveSemitagEventCommonProps({ userService }),
    rejecting: async ({ semitagId }, _args, _context, info) => {
      const checking = await prisma.semitagChecking.findUniqueOrThrow({ where: { semitagId } });
      if (checking.videoTagId) {
        logger.error({ path: info.path, parent: { semitagId } }, "SemitagChecking videoTagId must be null but not");
        throw new GraphQLError("Data inconsistency");
      }

      const { note } = checking;
      return SemitagRejectingModel.make({ semitagId, note });
    },
  }) satisfies Resolvers["SemitagRejectEvent"];
