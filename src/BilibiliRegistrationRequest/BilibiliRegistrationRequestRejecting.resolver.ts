import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { MkResolver } from "../utils/MkResolver.js";

export const mkBilibiliRegistrationRequestRejectingResolver: MkResolver<
  "BilibiliRegistrationRequestRejecting",
  "userService" | "BilibiliRegistrationRequestService"
> = ({ BilibiliRegistrationRequestService, userService }) => ({
  note: ({ note }) => note,
  request: ({ requestId }) =>
    BilibiliRegistrationRequestService.getByIdOrThrow(requestId).catch(() => {
      throw new GraphQLNotExistsInDBError("BilibiliRegistrationRequest", requestId);
    }),
  rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
});
