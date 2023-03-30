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

export const resolverGenerateAccessToken = ({ token }: Pick<ResolverDeps, "token">) =>
  (async (_parent, { duration }, { user: ctxUser }) => {
    // TODO: 現状管理者だけアクセストークンが発行できる
    if (!ctxUser || ctxUser.role !== UserRole.ADMINISTRATOR) {
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies ResolversTypes["GenerateAccessTokenReturnUnion"];
    }

    const accessToken = await token.sign({
      userId: ctxUser.id,
      duration: convertDuration(duration),
    });

    return {
      __typename: "GenerateAccessTokenSucceededPayload",
      accessToken,
    } satisfies ResolversTypes["GenerateAccessTokenReturnUnion"];
  }) satisfies MutationResolvers["generateAccessToken"];
