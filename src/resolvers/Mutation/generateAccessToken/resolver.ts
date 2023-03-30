import { UserRole } from "@prisma/client";

import {
  GenerateAccessTokenInputDuration,
  MutationResolvers,
  ResolversTypes,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

const convertDuration = (
  duration: GenerateAccessTokenInputDuration
): Parameters<ResolverDeps["token"]["sign"]>[0]["duration"] => {
  switch (duration) {
    case GenerateAccessTokenInputDuration.OneDay:
      return "1d";
    case GenerateAccessTokenInputDuration.ThreeDays:
      return "3d";
    case GenerateAccessTokenInputDuration.OneWeek:
      return "1w";
    case GenerateAccessTokenInputDuration.OneMonth:
      return "1m";
  }
};

export const resolverGenerateAccessToken = ({ token: jwt }: Pick<ResolverDeps, "token">) =>
  (async (_parent, { input }, { user: ctxUser }) => {
    // TODO: 現状管理者だけアクセストークンが発行できる
    if (!ctxUser || ctxUser.role !== UserRole.ADMINISTRATOR) {
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } as const;
    }

    const accessToken = await jwt.sign({
      userId: ctxUser.id,
      duration: convertDuration(input.duration),
    });

    return {
      __typename: "GenerateAccessTokenSuccessPayload",
      accessToken,
    } satisfies ResolversTypes["GenerateAccessTokenSuccessPayload"];
  }) satisfies MutationResolvers["generateAccessToken"];
