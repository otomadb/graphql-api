import { SemitagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel } from "../Semitag/model.js";
import { SemitagRejectingModel } from "../SemitagRejecting/model.js";
import { SemitagResolvingModel } from "../SemitagResolving/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveSemitagEventCommonProps = ({ auth0Management }: Pick<ResolverDeps, "auth0Management">) =>
  ({
    id: ({ id }): string => buildGqlId("SemitagEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0User(await auth0Management.getUser({ id: userId })),
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
  auth0Management,
}: Pick<ResolverDeps, "prisma" | "auth0Management">) =>
  ({
    ...resolveSemitagEventCommonProps({ auth0Management }),
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
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management">) =>
  ({
    ...resolveSemitagEventCommonProps({ auth0Management }),
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
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management">) =>
  ({
    ...resolveSemitagEventCommonProps({ auth0Management }),
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
