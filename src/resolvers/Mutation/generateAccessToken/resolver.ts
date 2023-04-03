import { GenerateAccessTokenInputDuration, MutationResolvers, ResolversTypes } from "../../graphql.js";
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
  (async (_parent, { duration }, { currentUser: ctxUser }) => {
    const accessToken = await token.sign({
      userId: ctxUser.id,
      duration: convertDuration(duration),
    });

    return {
      __typename: "GenerateAccessTokenSucceededPayload",
      accessToken,
    } satisfies ResolversTypes["GenerateAccessTokenReturnUnion"];
  }) satisfies MutationResolvers["generateAccessToken"];
