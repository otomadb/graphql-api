import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { MkResolver } from "../utils/MkResolver.js";

export const mkSoundcloudRegistrationRequestRejectingResolver: MkResolver<
  "SoundcloudRegistrationRequestRejecting",
  "userService" | "SoundcloudRegistrationRequestService"
> = ({ SoundcloudRegistrationRequestService, userService }) => ({
  note: ({ note }) => note,
  request: ({ requestId }) =>
    SoundcloudRegistrationRequestService.getByIdOrThrow(requestId).catch(() => {
      throw new GraphQLNotExistsInDBError("SoundcloudRegistrationRequest", requestId);
    }),
  rejectedBy: async ({ checkedById }) => userService.getById(checkedById),
});
